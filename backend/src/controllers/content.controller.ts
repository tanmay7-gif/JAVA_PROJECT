import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

export const listPublicContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search } = req.query as any;

    const where: any = { status: 'APPROVED' };
    if (category && category !== 'ALL') {
      const normalized = String(category).toLowerCase().replace(/[\s_-]+/g, '');
      const possibleCategories = [
        category,
        category.toUpperCase(),
        category.toLowerCase(),
        category.replace(/\s+/g, '_').toUpperCase(),
        category.replace(/_/g, ' '),
      ];
      if (normalized === 'guide') possibleCategories.push('Guide', 'GUIDE');
      if (normalized === 'nutrition') possibleCategories.push('Nutrition', 'NUTRITION');
      if (normalized === 'recovery') possibleCategories.push('Recovery', 'RECOVERY');
      if (normalized === 'workoutroutine') possibleCategories.push('Workout Routine', 'WORKOUT_ROUTINE', 'Workout_Routine');

      where.category = { in: Array.from(new Set(possibleCategories)) };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const contents = await prisma.fitnessContent.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, profile_image: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

export const listAllContentAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, category } = req.query as any;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const contents = await prisma.fitnessContent.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true, profile_image: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, category, media_url } = req.body;

    // If submitted by Admin, auto-approve, else default to PENDING
    const status = req.user!.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    const content = await prisma.fitnessContent.create({
      data: {
        creator_id: userId,
        title,
        description,
        category,
        media_url: media_url || null,
        status,
      },
    });

    await logAudit(userId, 'CREATE_FITNESS_CONTENT', { contentId: content.id, title, status });

    res.status(201).json({
      success: true,
      message: status === 'APPROVED' ? 'Content published immediately.' : 'Content submitted for Admin moderation.',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const moderateContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const { status, feedback } = req.body;

    const existing = await prisma.fitnessContent.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Content item not found.',
      });
      return;
    }

    const updated = await prisma.fitnessContent.update({
      where: { id },
      data: {
        status,
        feedback: feedback || null,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit(adminId, 'MODERATE_CONTENT', { contentId: id, status, feedback });

    res.status(200).json({
      success: true,
      message: `Content has been marked as ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const contents = await prisma.fitnessContent.findMany({
      where: { creator_id: userId },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContentAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.fitnessContent.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Content item not found.',
      });
      return;
    }

    await prisma.fitnessContent.delete({
      where: { id },
    });

    await logAudit(adminId, 'DELETE_FITNESS_CONTENT', { contentId: id, title: existing.title });

    res.status(200).json({
      success: true,
      message: 'Fitness content guide deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

