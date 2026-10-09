import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { ActivityService } from './activity.service.js';

export interface UserFilterOptions {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PlatformStatistics {
  users: {
    total: number;
    active: number;
    suspended: number;
    regularUsers: number;
    admins: number;
    growthLast30Days: number;
  };
  workouts: {
    totalWorkouts: number;
    totalCalories: number;
    totalDurationMinutes: number;
    totalDurationHours: number;
    averageDurationMinutes: number;
    averageCalories: number;
    byType: Array<{ type: string; count: number; calories: number }>;
    byIntensity: Array<{ intensity: string; count: number }>;
  };
  challenges: {
    totalChallenges: number;
    activeChallenges: number;
    totalParticipations: number;
    completedParticipations: number;
    inProgressParticipations: number;
    completionRate: number;
    topChallenges: Array<{
      id: string;
      title: string;
      targetMetric: string;
      targetValue: number;
      participantCount: number;
      completedCount: number;
    }>;
  };
  content: {
    totalContent: number;
    approved: number;
    pending: number;
    rejected: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  engagementTrend: Array<{
    day: string;
    workouts: number;
    calories: number;
    activeUsers: number;
  }>;
}

export class AdminService {
  /**
   * Calculate top-level KPIs for admin overview
   */
  static async getKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeWorkoutsToday, pendingContentCount, ongoingChallengesCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.workoutLog.count({
          where: { date: { gte: today } },
        }),
        prisma.fitnessContent.count({
          where: { status: 'PENDING' },
        }),
        prisma.challenge.count({
          where: { end_date: { gte: new Date() } },
        }),
      ]);

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const engagementTrend = await this.getRollingEngagement(7);

    return {
      kpis: {
        totalUsers,
        activeWorkoutsToday,
        pendingContentApprovals: pendingContentCount,
        ongoingChallenges: ongoingChallengesCount,
      },
      recentActivity: recentAuditLogs,
      engagementTrend,
    };
  }

  /**
   * Calculate real, comprehensive database-driven platform statistics
   */
  static async getPlatformStatistics(): Promise<PlatformStatistics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // 1. User Demographic Aggregations
    const [totalUsers, activeUsers, suspendedUsers, regularUsers, adminUsers, growthLast30Days] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { is_active: true } }),
        prisma.user.count({ where: { is_active: false } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
      ]);

    // 2. Workout Aggregations & Groupings
    const [totalWorkouts, workoutAggregate, workoutsByType, workoutsByIntensity] =
      await Promise.all([
        prisma.workoutLog.count(),
        prisma.workoutLog.aggregate({
          _sum: { calories_burned: true, duration_minutes: true },
          _avg: { calories_burned: true, duration_minutes: true },
        }),
        prisma.workoutLog.groupBy({
          by: ['type'],
          _count: { id: true },
          _sum: { calories_burned: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.workoutLog.groupBy({
          by: ['intensity'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ]);

    const totalCalories = workoutAggregate._sum.calories_burned || 0;
    const totalDurationMinutes = workoutAggregate._sum.duration_minutes || 0;
    const totalDurationHours = Math.round((totalDurationMinutes / 60) * 10) / 10;
    const averageDurationMinutes = Math.round(workoutAggregate._avg.duration_minutes || 0);
    const averageCalories = Math.round(workoutAggregate._avg.calories_burned || 0);

    const formattedByType = workoutsByType.map((g) => ({
      type: g.type,
      count: g._count.id,
      calories: g._sum.calories_burned || 0,
    }));

    const formattedByIntensity = workoutsByIntensity.map((g) => ({
      intensity: g.intensity,
      count: g._count.id,
    }));

    // 3. Challenge & Participation Aggregations
    const [
      totalChallenges,
      activeChallenges,
      totalParticipations,
      completedParticipations,
      inProgressParticipations,
      challengesWithParticipants,
    ] = await Promise.all([
      prisma.challenge.count(),
      prisma.challenge.count({ where: { end_date: { gte: new Date() } } }),
      prisma.userChallenge.count(),
      prisma.userChallenge.count({ where: { status: 'COMPLETED' } }),
      prisma.userChallenge.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.challenge.findMany({
        take: 5,
        include: {
          participants: {
            select: { status: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const completionRate =
      totalParticipations > 0 ? Math.round((completedParticipations / totalParticipations) * 100) : 0;

    const topChallenges = challengesWithParticipants.map((ch) => ({
      id: ch.id,
      title: ch.title,
      targetMetric: ch.target_metric,
      targetValue: ch.target_value,
      participantCount: ch.participants.length,
      completedCount: ch.participants.filter((p) => p.status === 'COMPLETED').length,
    }));

    // 4. Content Moderation Pipeline Aggregations
    const [totalContent, approvedContent, pendingContent, rejectedContent, contentByCategory] =
      await Promise.all([
        prisma.fitnessContent.count(),
        prisma.fitnessContent.count({ where: { status: 'APPROVED' } }),
        prisma.fitnessContent.count({ where: { status: 'PENDING' } }),
        prisma.fitnessContent.count({ where: { status: 'REJECTED' } }),
        prisma.fitnessContent.groupBy({
          by: ['category'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ]);

    const formattedByCategory = contentByCategory.map((c) => ({
      category: c.category,
      count: c._count.id,
    }));

    // 5. 7-Day Rolling Engagement Trend
    const engagementTrend = await this.getRollingEngagement(7);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        regularUsers,
        admins: adminUsers,
        growthLast30Days,
      },
      workouts: {
        totalWorkouts,
        totalCalories,
        totalDurationMinutes,
        totalDurationHours,
        averageDurationMinutes,
        averageCalories,
        byType: formattedByType,
        byIntensity: formattedByIntensity,
      },
      challenges: {
        totalChallenges,
        activeChallenges,
        totalParticipations,
        completedParticipations,
        inProgressParticipations,
        completionRate,
        topChallenges,
      },
      content: {
        totalContent,
        approved: approvedContent,
        pending: pendingContent,
        rejected: rejectedContent,
        byCategory: formattedByCategory,
      },
      engagementTrend,
    };
  }

  /**
   * Helper: Calculate daily workout sessions, calories, and unique active users
   */
  private static async getRollingEngagement(days = 7) {
    const trend: Array<{ day: string; workouts: number; calories: number; activeUsers: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const [workoutsCount, sumAgg, distinctUsersGroup] = await Promise.all([
        prisma.workoutLog.count({
          where: { date: { gte: start, lte: end } },
        }),
        prisma.workoutLog.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { calories_burned: true },
        }),
        prisma.workoutLog.findMany({
          where: { date: { gte: start, lte: end } },
          select: { user_id: true },
        }),
      ]);

      const distinctUsers = new Set(distinctUsersGroup.map((w) => w.user_id)).size;

      trend.push({
        day: start.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: workoutsCount,
        calories: sumAgg._sum.calories_burned || 0,
        activeUsers: distinctUsers,
      });
    }

    return trend;
  }

  /**
   * User directory listing with search, filtering, and workout telemetry
   */
  static async listUsers(options: UserFilterOptions = {}) {
    const { search, role, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }
    if (status && status !== 'ALL') {
      if (status.toUpperCase() === 'ACTIVE') where.is_active = true;
      if (status.toUpperCase() === 'SUSPENDED' || status.toUpperCase() === 'INACTIVE') where.is_active = false;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile_image: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: { workouts: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      profile_image: u.profile_image,
      is_active: u.is_active,
      status: u.is_active ? 'Active' : 'Suspended',
      workoutsCount: u._count.workouts,
      workoutsLogged: u._count.workouts,
      joinedDate: u.created_at.toISOString().split('T')[0],
      createdAt: u.created_at.toISOString(),
      updatedAt: u.updated_at.toISOString(),
    }));

    return {
      users: formatted,
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Provision user by admin
   */
  static async createUser(adminId: string, data: { name: string; email: string; password?: string; role?: string }) {
    const { name, email, password, role } = data;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      const error: any = new Error('An account with this email address already exists.');
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'FitPulse123!', salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password_hash,
        role: role || 'USER',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    await ActivityService.log(adminId, 'ADMIN_CREATE_USER', { targetUserId: user.id, email: user.email });
    return user;
  }

  /**
   * Update user details by admin
   */
  static async updateUser(
    adminId: string,
    targetUserId: string,
    updates: { name?: string; email?: string; role?: string; is_active?: boolean; status?: string }
  ) {
    if (targetUserId === adminId) {
      if (updates.role && updates.role !== 'ADMIN') {
        const error: any = new Error('You cannot revoke your own administrator role.');
        error.status = 400;
        throw error;
      }
      if (updates.is_active === false || updates.status === 'Suspended') {
        const error: any = new Error('You cannot deactivate your own account.');
        error.status = 400;
        throw error;
      }
    }

    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      const error: any = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    if (updates.email && updates.email.toLowerCase() !== existing.email) {
      const duplicate = await prisma.user.findUnique({ where: { email: updates.email.toLowerCase() } });
      if (duplicate) {
        const error: any = new Error('Email address already assigned to another user.');
        error.status = 409;
        throw error;
      }
    }

    const resolvedActive =
      updates.is_active !== undefined
        ? Boolean(updates.is_active)
        : updates.status
        ? updates.status.toUpperCase() === 'ACTIVE'
        : existing.is_active;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email.toLowerCase() }),
        ...(updates.role && { role: updates.role }),
        is_active: resolvedActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        updated_at: true,
      },
    });

    await ActivityService.log(adminId, 'ADMIN_UPDATE_USER', { targetUserId, updates });

    return {
      ...updated,
      status: updated.is_active ? 'Active' : 'Suspended',
    };
  }

  /**
   * Update user role
   */
  static async updateUserRole(adminId: string, targetUserId: string, role: string) {
    if (targetUserId === adminId && role !== 'ADMIN') {
      const error: any = new Error('You cannot revoke your own administrator role.');
      error.status = 400;
      throw error;
    }

    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      const error: any = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, is_active: true, updated_at: true },
    });

    await ActivityService.log(adminId, 'ADMIN_UPDATE_ROLE', {
      targetUserId,
      oldRole: existing.role,
      newRole: role,
    });

    return updated;
  }

  /**
   * Toggle user active/suspended state
   */
  static async toggleUserStatus(adminId: string, targetUserId: string, isActive: boolean) {
    if (targetUserId === adminId && !isActive) {
      const error: any = new Error('You cannot deactivate your own account.');
      error.status = 400;
      throw error;
    }

    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      const error: any = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { is_active: isActive },
      select: { id: true, name: true, email: true, role: true, is_active: true, updated_at: true },
    });

    await ActivityService.log(adminId, 'ADMIN_TOGGLE_USER_STATUS', {
      targetUserId,
      is_active: isActive,
    });

    return {
      ...updated,
      status: updated.is_active ? 'Active' : 'Suspended',
    };
  }

  /**
   * Delete user account by admin
   */
  static async deleteUser(adminId: string, targetUserId: string) {
    if (targetUserId === adminId) {
      const error: any = new Error('Admin cannot delete their own account.');
      error.status = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      const error: any = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    await prisma.user.delete({ where: { id: targetUserId } });
    await ActivityService.log(adminId, 'ADMIN_DELETE_USER', { targetUserId, email: user.email });
    return true;
  }

  /**
   * Retrieve platform settings from database with auto-seeding
   */
  static async getSystemSettings(adminId?: string) {
    let settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    if (settings.length === 0) {
      const defaults = [
        { key: 'maintenance_mode', value: 'false', description: 'Platform Maintenance Mode (Admins only)' },
        { key: 'user_registration_enabled', value: 'true', description: 'Permit new athlete registrations' },
        { key: 'require_email_verify', value: 'true', description: 'Mandatory email verification on onboarding' },
        { key: 'dynamic_met_scaling', value: 'true', description: 'Dynamic MET Caloric Burn scaling multiplier' },
        { key: 'max_workout_duration_minutes', value: '360', description: 'Maximum allowable single session duration' },
      ];

      for (const d of defaults) {
        await prisma.systemSetting.create({
          data: {
            key: d.key,
            value: d.value,
            description: d.description,
            updated_by: adminId || null,
          },
        });
      }

      settings = await prisma.systemSetting.findMany({
        orderBy: { key: 'asc' },
      });
    }

    return settings;
  }

  /**
   * Upsert system setting in database
   */
  static async updateSystemSetting(adminId: string, key: string, value: string, description?: string) {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        ...(description && { description }),
        updated_by: adminId,
      },
      create: {
        key,
        value: String(value),
        description: description || null,
        updated_by: adminId,
      },
    });

    await ActivityService.log(adminId, 'UPDATE_SYSTEM_SETTING', { key, value });
    return setting;
  }
}
