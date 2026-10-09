import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

// Calorie estimate calculation based on MET (Metabolic Equivalent of Task)
export const calculateEstimatedCalories = (type: string, durationMinutes: number, intensity: 'LOW' | 'MEDIUM' | 'HIGH'): number => {
  const metTable: Record<string, { LOW: number; MEDIUM: number; HIGH: number }> = {
    Cardio: { LOW: 6, MEDIUM: 8.5, HIGH: 11.5 },
    Running: { LOW: 8, MEDIUM: 11, HIGH: 14 },
    Cycling: { LOW: 5.5, MEDIUM: 8, HIGH: 11 },
    Strength: { LOW: 3.5, MEDIUM: 5.5, HIGH: 7.5 },
    HIIT: { LOW: 8, MEDIUM: 11.5, HIGH: 15 },
    Yoga: { LOW: 2.5, MEDIUM: 3.5, HIGH: 5 },
    Swimming: { LOW: 6, MEDIUM: 9, HIGH: 12 },
    Pilates: { LOW: 3, MEDIUM: 4.5, HIGH: 6 },
    Walking: { LOW: 3, MEDIUM: 4, HIGH: 5 },
  };

  // Default fallback MET
  const metRow = metTable[type] || { LOW: 4, MEDIUM: 7, HIGH: 10 };
  const met = metRow[intensity] || 6;
  // Assume avg reference weight 70kg: calories = MET * weight(kg) * (duration in hours)
  const calories = Math.round(met * 70 * (durationMinutes / 60));
  return calories;
};

export const createWorkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type, duration_minutes, intensity, calories_burned, date, notes } = req.body;

    const workout = await prisma.workoutLog.create({
      data: {
        user_id: userId,
        type,
        duration_minutes,
        intensity: intensity || 'MEDIUM',
        calories_burned: calories_burned !== undefined ? calories_burned : calculateEstimatedCalories(type, duration_minutes, intensity || 'MEDIUM'),
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    // Check if any in-progress challenges can be progressed automatically
    const activeChallenges = await prisma.userChallenge.findMany({
      where: {
        user_id: userId,
        status: 'IN_PROGRESS',
      },
      include: {
        challenge: true,
      },
    });

    for (const uc of activeChallenges) {
      let increment = 0;
      if (uc.challenge.target_metric === 'CALORIES') {
        increment = workout.calories_burned;
      } else if (uc.challenge.target_metric === 'DURATION') {
        increment = workout.duration_minutes;
      } else if (uc.challenge.target_metric === 'WORKOUT_COUNT') {
        increment = 1;
      }

      if (increment > 0) {
        const newProgress = uc.current_progress + increment;
        const isComplete = newProgress >= uc.challenge.target_value;

        await prisma.userChallenge.update({
          where: { id: uc.id },
          data: {
            current_progress: newProgress,
            ...(isComplete && {
              status: 'COMPLETED',
              completed_at: new Date(),
            }),
          },
        });
      }
    }

    await logAudit(userId, 'LOG_WORKOUT', { workoutId: workout.id, type, duration: duration_minutes });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully.',
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const listWorkouts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, type, limit = 50, page = 1 } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { user_id: userId };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [workouts, total] = await Promise.all([
      prisma.workoutLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.workoutLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        workouts,
        pagination: {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.workoutLog.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Workout log entry not found or you do not have permission to modify it.',
      });
      return;
    }

    const { type, duration_minutes, intensity, calories_burned, date, notes } = req.body;

    const updated = await prisma.workoutLog.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(duration_minutes !== undefined && { duration_minutes }),
        ...(intensity !== undefined && { intensity }),
        ...(calories_burned !== undefined && { calories_burned }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
      },
    });

    await logAudit(userId, 'UPDATE_WORKOUT', { workoutId: id });

    res.status(200).json({
      success: true,
      message: 'Workout log updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.workoutLog.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Workout log not found or permission denied.',
      });
      return;
    }

    await prisma.workoutLog.delete({
      where: { id },
    });

    await logAudit(userId, 'DELETE_WORKOUT', { workoutId: id, type: existing.type });

    res.status(200).json({
      success: true,
      message: 'Workout log removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Fetch all workouts for user for deep aggregation
    const workouts = await prisma.workoutLog.findMany({
      where: { user_id: userId },
      orderBy: { date: 'asc' },
    });

    // 7-day stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWorkouts = workouts.filter((w: any) => new Date(w.date) >= sevenDaysAgo);
    const weeklyDurationMinutes = recentWorkouts.reduce((acc: number, curr: any) => acc + curr.duration_minutes, 0);
    const weeklyCaloriesBurned = recentWorkouts.reduce((acc: number, curr: any) => acc + curr.calories_burned, 0);
    const weeklyWorkoutsCount = recentWorkouts.length;

    // 30-day monthly stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyWorkouts = workouts.filter((w: any) => new Date(w.date) >= thirtyDaysAgo);
    const monthlyDurationMinutes = monthlyWorkouts.reduce((acc: number, curr: any) => acc + curr.duration_minutes, 0);
    const monthlyCaloriesBurned = monthlyWorkouts.reduce((acc: number, curr: any) => acc + curr.calories_burned, 0);
    const monthlyWorkoutsCount = monthlyWorkouts.length;
    const monthlyWorkoutHours = Number((monthlyDurationMinutes / 60).toFixed(1));

    // Challenges progress
    const userChallenges = await prisma.userChallenge.findMany({
      where: { user_id: userId },
    });
    const enrolledChallenges = userChallenges.length;
    const activeChallenges = userChallenges.filter((c: any) => c.status === 'IN_PROGRESS').length;
    const completedChallenges = userChallenges.filter((c: any) => c.status === 'COMPLETED').length;
    const challengeCompletionRate = enrolledChallenges > 0 ? Math.round((completedChallenges / enrolledChallenges) * 100) : 0;

    // Goals progress calculated from real database entries
    const goals = await prisma.goal.findMany({
      where: { user_id: userId },
    });
    const totalGoals = goals.length;
    const activeGoals = goals.filter((g: any) => g.status === 'IN_PROGRESS').length;
    const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED').length;
    const averageCompletionPercentage = totalGoals > 0
      ? Math.round(
          (goals.reduce((acc: number, g: any) => acc + Math.min(100, Math.round(((g.current_value || 0) / (g.target_value || 1)) * 100)), 0) / totalGoals) * 10
        ) / 10
      : 0;

    // Intensity breakdown
    const intensityCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    workouts.forEach((w: any) => {
      const level = w.intensity || 'MEDIUM';
      intensityCounts[level] = (intensityCounts[level] || 0) + 1;
    });

    const intensityBreakdown = Object.keys(intensityCounts).map((key) => ({
      name: key,
      value: intensityCounts[key],
    }));

    // Workout type distribution
    const typeCounts: Record<string, number> = {};
    workouts.forEach((w: any) => {
      typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
    });

    const typeBreakdown = Object.keys(typeCounts).map((key) => ({
      name: key,
      count: typeCounts[key],
    }));

    // Daily activity trend for last 7-14 days
    const dailyMap: Record<string, { date: string; calories: number; duration: number; workoutsCount: number }> = {};
    
    // Seed last 7 days so charts are smooth even if user missed days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap[dateKey] = { date: dayName, calories: 0, duration: 0, workoutsCount: 0 };
    }

    workouts.forEach((w: any) => {
      const dateKey = new Date(w.date).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].calories += w.calories_burned;
        dailyMap[dateKey].duration += w.duration_minutes;
        dailyMap[dateKey].workoutsCount += 1;
      }
    });

    const dailyTrend = Object.values(dailyMap);

    // Total lifetime metrics
    const totalLifetimeCalories = workouts.reduce((acc: number, curr: any) => acc + curr.calories_burned, 0);
    const totalLifetimeWorkouts = workouts.length;
    const totalLifetimeMinutes = workouts.reduce((acc: number, curr: any) => acc + curr.duration_minutes, 0);


    res.status(200).json({
      success: true,
      data: {
        summary: {
          weeklyWorkoutHours: Number((weeklyDurationMinutes / 60).toFixed(1)),
          weeklyCaloriesBurned,
          weeklyWorkoutsCount,
          monthlyWorkoutHours,
          monthlyCaloriesBurned,
          monthlyWorkoutsCount,
          activeChallengesCount: activeChallenges,
          totalLifetimeCalories,
          totalLifetimeWorkouts,
          totalLifetimeHours: Number((totalLifetimeMinutes / 60).toFixed(1)),
        },
        challengeProgress: {
          enrolledChallenges,
          activeChallenges,
          completedChallenges,
          completionRate: challengeCompletionRate,
        },
        goalProgress: {
          totalGoals,
          activeGoals,
          completedGoals,
          averageCompletionPercentage,
        },
        dailyTrend,
        intensityBreakdown,
        typeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEstimate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type = 'Cardio', duration_minutes = 30, intensity = 'MEDIUM' } = req.query as any;
    const estimatedCalories = calculateEstimatedCalories(String(type), Number(duration_minutes), intensity);

    res.status(200).json({
      success: true,
      data: {
        type,
        duration_minutes: Number(duration_minutes),
        intensity,
        estimated_calories: estimatedCalories,
      },
    });
  } catch (error) {
    next(error);
  }
};
