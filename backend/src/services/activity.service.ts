import prisma from '../config/database.js';

export interface ActivityFilterOptions {
  action?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivityStats {
  totalLogs: number;
  byAction: Record<string, number>;
  todayCount: number;
}

export class ActivityService {
  /**
   * Log an immutable activity/audit record to the database
   */
  static async log(
    userId: string | null,
    action: string,
    details?: Record<string, any> | string
  ): Promise<void> {
    try {
      const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          action,
          details: detailsString || null,
        },
      });
    } catch (error) {
      // Graceful error capture to prevent audit logging failures from interrupting primary business operations
      console.error('[ActivityService] Failed to record activity log:', error);
    }
  }

  /**
   * Query activity logs with filtering, search, and pagination
   */
  static async getLogs(options: ActivityFilterOptions = {}) {
    const { action, userId, search, page = 1, limit = 50 } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (userId) {
      where.user_id = userId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { action: { contains: term } },
        { details: { contains: term } },
        { user: { email: { contains: term } } },
        { user: { name: { contains: term } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profile_image: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const formatted = logs.map((log) => {
      let parsedDetails: any = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = log.details;
        }
      }

      return {
        id: log.id,
        action: log.action,
        userId: log.user_id,
        user: log.user,
        timestamp: log.timestamp,
        details: parsedDetails,
        rawDetails: log.details,
      };
    });

    return {
      logs: formatted,
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Retrieve summary statistics of logged activity
   */
  static async getStats(): Promise<ActivityStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayCount, actionGroups] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { timestamp: { gte: today } },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const byAction: Record<string, number> = {};
    for (const group of actionGroups) {
      byAction[group.action] = group._count.id;
    }

    return {
      totalLogs,
      todayCount,
      byAction,
    };
  }
}
