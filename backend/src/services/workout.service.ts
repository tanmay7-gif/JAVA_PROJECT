import prisma from '../config/database.js';
import { ActivityService } from './activity.service.js';

export interface CreateWorkoutInput {
  userId: string;
  type: string;
  duration_minutes: number;
  intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
  calories_burned?: number;
  date?: string | Date;
  notes?: string;
}

export class WorkoutService {
  /**
   * Log a new workout and propagate updates to active challenges and goals
   */
  static async createWorkout(data: CreateWorkoutInput) {
    const { userId, type, duration_minutes, intensity = 'MEDIUM', notes, date } = data;

    // Dynamic MET calorie calculation fallback
    const calories_burned = data.calories_burned !== undefined && data.calories_burned !== null
      ? Number(data.calories_burned)
      : this.calculateEstimatedCalories(type, duration_minutes, intensity);

    const workout = await prisma.workoutLog.create({
      data: {
        user_id: userId,
        type,
        duration_minutes: Number(duration_minutes),
        intensity,
        calories_burned,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    // Propagate progress to active enrolled challenges
    const userChallenges = await prisma.userChallenge.findMany({
      where: {
        user_id: userId,
        status: 'IN_PROGRESS',
      },
      include: {
        challenge: true,
      },
    });

    for (const uc of userChallenges) {
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

        if (isComplete) {
          await ActivityService.log(userId, 'CHALLENGE_COMPLETED', {
            challengeId: uc.challenge.id,
            title: uc.challenge.title,
            progress: newProgress,
          });
        }
      }
    }

    await ActivityService.log(userId, 'LOG_WORKOUT', {
      workoutId: workout.id,
      type,
      duration: duration_minutes,
      calories: calories_burned,
    });

    return workout;
  }

  /**
   * Update an existing workout log
   */
  static async updateWorkout(userId: string, workoutId: string, updates: any) {
    const existing = await prisma.workoutLog.findFirst({
      where: { id: workoutId, user_id: userId },
    });

    if (!existing) {
      const error: any = new Error('Workout log entry not found or you do not have permission to modify it.');
      error.status = 404;
      throw error;
    }

    const updated = await prisma.workoutLog.update({
      where: { id: workoutId },
      data: {
        ...(updates.type !== undefined && { type: updates.type }),
        ...(updates.duration_minutes !== undefined && { duration_minutes: Number(updates.duration_minutes) }),
        ...(updates.intensity !== undefined && { intensity: updates.intensity }),
        ...(updates.calories_burned !== undefined && { calories_burned: Number(updates.calories_burned) }),
        ...(updates.date !== undefined && { date: new Date(updates.date) }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
      },
    });

    await ActivityService.log(userId, 'UPDATE_WORKOUT', { workoutId });
    return updated;
  }

  /**
   * Delete an existing workout log
   */
  static async deleteWorkout(userId: string, workoutId: string) {
    const existing = await prisma.workoutLog.findFirst({
      where: { id: workoutId, user_id: userId },
    });

    if (!existing) {
      const error: any = new Error('Workout log not found or permission denied.');
      error.status = 404;
      throw error;
    }

    await prisma.workoutLog.delete({
      where: { id: workoutId },
    });

    await ActivityService.log(userId, 'DELETE_WORKOUT', { workoutId, type: existing.type });
    return true;
  }

  /**
   * Standardized MET Formula for metabolic caloric expenditure estimation
   */
  static calculateEstimatedCalories(type: string, durationMinutes: number, intensity = 'MEDIUM', weightKg = 70): number {
    const metTable: Record<string, number> = {
      RUNNING: 9.8,
      CYCLING: 7.5,
      SWIMMING: 8.0,
      HIIT: 9.0,
      STRENGTH: 5.5,
      YOGA: 3.0,
      WALKING: 3.8,
      PILATES: 3.5,
      BOXING: 9.5,
      ROWING: 7.0,
    };

    const baseMet = metTable[type.toUpperCase()] || 6.0;
    const intensityMultiplier = intensity === 'HIGH' ? 1.25 : intensity === 'LOW' ? 0.8 : 1.0;
    const effectiveMet = baseMet * intensityMultiplier;

    return Math.round((effectiveMet * 3.5 * weightKg * durationMinutes) / 200);
  }
}
