import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

/**
 * Format goal model to include calculated completion percentage and aliases
 */
function formatGoal(goal: any) {
  const target = Number(goal.target_value) || 1;
  const current = Number(goal.current_value) || 0;
  const completionPercentage = Math.min(100, Math.round((current / target) * 100));

  return {
    id: goal.id,
    userId: goal.user_id,
    title: goal.title,
    description: goal.description,
    goalType: goal.goal_type,
    type: goal.goal_type,
    targetValue: goal.target_value,
    target_value: goal.target_value,
    currentValue: goal.current_value,
    current_value: goal.current_value,
    unit: goal.unit,
    status: goal.status,
    startDate: goal.start_date,
    start_date: goal.start_date,
    targetDate: goal.target_date,
    target_date: goal.target_date,
    completedAt: goal.completed_at,
    completed_at: goal.completed_at,
    completionPercentage,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  };
}

/**
 * List all fitness goals for current athlete
 */
export const getGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query as { status?: string };

    const goals = await prisma.goal.findMany({
      where: {
        user_id: userId,
        ...(status && { status: status.toUpperCase() }),
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: goals.map(formatGoal),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve specific fitness goal by ID
 */
export const getGoalById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Fitness goal not found or access denied.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatGoal(goal),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new personal fitness goal
 */
export const createGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      title,
      description,
      goalType,
      type,
      targetValue,
      target_value,
      currentValue,
      current_value,
      unit,
      targetDate,
      target_date,
    } = req.body;

    if (!title || (!targetValue && !target_value)) {
      res.status(400).json({
        success: false,
        message: 'Title and targetValue are required.',
      });
      return;
    }

    const resolvedGoalType = (goalType || type || 'CALORIE_BURN').toUpperCase();
    const resolvedTarget = Number(targetValue || target_value);
    const resolvedCurrent = Number(currentValue || current_value || 0);
    const resolvedUnit =
      unit || (resolvedGoalType === 'CALORIE_BURN' ? 'kcal' : resolvedGoalType === 'DURATION_MINUTES' ? 'mins' : 'count');
    const resolvedTargetDate = targetDate || target_date ? new Date(targetDate || target_date) : new Date(Date.now() + 30 * 86400000);

    const isCompleted = resolvedCurrent >= resolvedTarget;

    const goal = await prisma.goal.create({
      data: {
        user_id: userId,
        title,
        description: description || null,
        goal_type: resolvedGoalType,
        target_value: resolvedTarget,
        current_value: resolvedCurrent,
        unit: resolvedUnit,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        target_date: resolvedTargetDate,
        completed_at: isCompleted ? new Date() : null,
      },
    });

    await logAudit(userId, 'CREATE_GOAL', { goalId: goal.id, title: goal.title, target: resolvedTarget });

    res.status(201).json({
      success: true,
      message: 'Fitness goal established successfully.',
      data: formatGoal(goal),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing fitness goal
 */
export const updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const {
      title,
      description,
      goalType,
      type,
      targetValue,
      target_value,
      currentValue,
      current_value,
      unit,
      targetDate,
      target_date,
      status,
    } = req.body;

    const existing = await prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Fitness goal not found or access denied.',
      });
      return;
    }

    const newTarget = targetValue !== undefined || target_value !== undefined
      ? Number(targetValue !== undefined ? targetValue : target_value)
      : existing.target_value;

    const newCurrent = currentValue !== undefined || current_value !== undefined
      ? Number(currentValue !== undefined ? currentValue : current_value)
      : existing.current_value;

    let newStatus = status ? status.toUpperCase() : existing.status;
    let completedAt = existing.completed_at;

    if (newCurrent >= newTarget && newStatus !== 'ABANDONED') {
      newStatus = 'COMPLETED';
      if (!completedAt) completedAt = new Date();
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...((goalType || type) && { goal_type: (goalType || type).toUpperCase() }),
        target_value: newTarget,
        current_value: newCurrent,
        ...(unit && { unit }),
        status: newStatus,
        completed_at: completedAt,
        ...( (targetDate || target_date) && { target_date: new Date(targetDate || target_date) }),
      },
    });

    await logAudit(userId, 'UPDATE_GOAL', { goalId: id, current: newCurrent, target: newTarget, status: newStatus });

    res.status(200).json({
      success: true,
      message: 'Fitness goal updated successfully.',
      data: formatGoal(updated),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Increment goal progress towards target
 */
export const incrementGoalProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { increment = 1 } = req.body;

    const existing = await prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Fitness goal not found or access denied.',
      });
      return;
    }

    const newCurrent = existing.current_value + Number(increment);
    const isCompleted = newCurrent >= existing.target_value;
    const newStatus = isCompleted ? 'COMPLETED' : existing.status;
    const completedAt = isCompleted && !existing.completed_at ? new Date() : existing.completed_at;

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        current_value: newCurrent,
        status: newStatus,
        completed_at: completedAt,
      },
    });

    await logAudit(userId, 'INCREMENT_GOAL_PROGRESS', { goalId: id, increment, newCurrent });

    res.status(200).json({
      success: true,
      message: 'Goal progress incremented successfully.',
      data: formatGoal(updated),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Abandon an active goal
 */
export const abandonGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Fitness goal not found or access denied.',
      });
      return;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: { status: 'ABANDONED' },
    });

    await logAudit(userId, 'ABANDON_GOAL', { goalId: id });

    res.status(200).json({
      success: true,
      message: 'Fitness goal marked as abandoned.',
      data: formatGoal(updated),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a goal permanently
 */
export const deleteGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.goal.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Fitness goal not found or access denied.',
      });
      return;
    }

    await prisma.goal.delete({
      where: { id },
    });

    await logAudit(userId, 'DELETE_GOAL', { goalId: id, title: existing.title });

    res.status(200).json({
      success: true,
      message: 'Fitness goal deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
