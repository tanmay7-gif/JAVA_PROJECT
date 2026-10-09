import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

export const listChallenges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const challenges = await prisma.challenge.findMany({
      include: {
        _count: {
          select: { participants: true },
        },
        participants: userId
          ? {
              where: { user_id: userId },
              select: {
                id: true,
                status: true,
                current_progress: true,
                joined_at: true,
                completed_at: true,
              },
            }
          : false,
      },
      orderBy: { created_at: 'desc' },
    });

    const formatted = challenges.map((c: any) => {
      const userParticipation = c.participants && c.participants.length > 0 ? c.participants[0] : null;
      const progressPercent = userParticipation
        ? Math.min(100, Math.round((userParticipation.current_progress / c.target_value) * 100))
        : 0;

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        target_metric: c.target_metric,
        target_value: c.target_value,
        start_date: c.start_date,
        end_date: c.end_date,
        reward_badge: c.reward_badge,
        total_participants: c._count.participants,
        user_status: userParticipation?.status || 'NOT_JOINED',
        user_progress: userParticipation?.current_progress || 0,
        progress_percent: progressPercent,
        completed_at: userParticipation?.completed_at || null,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const joinChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { challengeId } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
      return;
    }

    const existing = await prisma.userChallenge.findUnique({
      where: {
        user_id_challenge_id: {
          user_id: userId,
          challenge_id: challengeId,
        },
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'You have already joined this challenge.',
      });
      return;
    }

    const userChallenge = await prisma.userChallenge.create({
      data: {
        user_id: userId,
        challenge_id: challengeId,
        status: 'IN_PROGRESS',
        current_progress: 0,
      },
    });

    await logAudit(userId, 'JOIN_CHALLENGE', { challengeId, title: challenge.title });

    res.status(201).json({
      success: true,
      message: `Successfully joined "${challenge.title}" challenge!`,
      data: userChallenge,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyChallenges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const userChallenges = await prisma.userChallenge.findMany({
      where: { user_id: userId },
      include: { challenge: true },
      orderBy: { joined_at: 'desc' },
    });

    const active = userChallenges
      .filter((uc: any) => uc.status === 'IN_PROGRESS')
      .map((uc: any) => ({
        ...uc,
        progress_percentage: Math.min(100, Math.round((uc.current_progress / uc.challenge.target_value) * 100)),
      }));

    const completed = userChallenges
      .filter((uc: any) => uc.status === 'COMPLETED')
      .map((uc: any) => ({
        ...uc,
        badge: uc.challenge.reward_badge,
      }));

    res.status(200).json({
      success: true,
      data: {
        active,
        completed,
        total_badges_earned: completed.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserChallengeProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { challengeId } = req.params;
    const { current_progress, progress } = req.body;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found.' });
      return;
    }

    const existing = await prisma.userChallenge.findUnique({
      where: {
        user_id_challenge_id: { user_id: userId, challenge_id: challengeId },
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'You have not joined this challenge yet.' });
      return;
    }

    const newProgress = Number(current_progress !== undefined ? current_progress : progress);
    const isCompleted = newProgress >= challenge.target_value;
    const status = isCompleted ? 'COMPLETED' : existing.status;
    const completedAt = isCompleted && !existing.completed_at ? new Date() : existing.completed_at;

    const updated = await prisma.userChallenge.update({
      where: {
        user_id_challenge_id: { user_id: userId, challenge_id: challengeId },
      },
      data: {
        current_progress: newProgress,
        status,
        completed_at: completedAt,
      },
    });

    await logAudit(userId, 'UPDATE_CHALLENGE_PROGRESS', { challengeId, progress: newProgress, status });

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Congratulations! Challenge milestone completed!' : 'Challenge progress updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const createChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { title, description, target_metric, target_value, start_date, end_date, reward_badge } = req.body;

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        target_metric,
        target_value,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        reward_badge,
      },
    });

    await logAudit(adminId, 'CREATE_CHALLENGE', { challengeId: challenge.id, title });

    res.status(201).json({
      success: true,
      message: 'New challenge launched successfully.',
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { challengeId } = req.params;
    const { title, description, target_metric, target_value, start_date, end_date, reward_badge } = req.body;

    const existing = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Challenge not found.' });
      return;
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(target_metric && { target_metric }),
        ...(target_value !== undefined && { target_value: Number(target_value) }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(reward_badge !== undefined && { reward_badge }),
      },
    });

    await logAudit(adminId, 'UPDATE_CHALLENGE', { challengeId, title: updated.title });

    res.status(200).json({
      success: true,
      message: 'Challenge parameters updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { challengeId } = req.params;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found.' });
      return;
    }

    await prisma.userChallenge.deleteMany({ where: { challenge_id: challengeId } });
    await prisma.challenge.delete({ where: { id: challengeId } });

    await logAudit(adminId, 'DELETE_CHALLENGE', { challengeId, title: challenge.title });

    res.status(200).json({
      success: true,
      message: 'Challenge archived and enrollments removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const monitorChallenge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { challengeId } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, profile_image: true },
            },
          },
        },
      },
    });

    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found.' });
      return;
    }

    const totalParticipants = challenge.participants.length;
    const completedCount = challenge.participants.filter((p: any) => p.status === 'COMPLETED').length;
    const inProgressCount = totalParticipants - completedCount;
    const completionRate = totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          target_metric: challenge.target_metric,
          target_value: challenge.target_value,
          start_date: challenge.start_date,
          end_date: challenge.end_date,
          reward_badge: challenge.reward_badge,
        },
        totalParticipants,
        completedCount,
        inProgressCount,
        completionRate,
        participants: challenge.participants.map((p: any) => ({
          id: p.id,
          userId: p.user.id,
          userName: p.user.name,
          userEmail: p.user.email,
          currentProgress: p.current_progress,
          progressPercentage: Math.min(100, Math.round((p.current_progress / challenge.target_value) * 100)),
          status: p.status,
          joinedAt: p.joined_at,
          completedAt: p.completed_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChallengeHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const history = await prisma.userChallenge.findMany({
      where: { user_id: userId },
      include: { challenge: true },
      orderBy: { joined_at: 'desc' },
    });

    const formatted = history.map((h: any) => ({
      ...h,
      progressPercentage: Math.min(100, Math.round((h.current_progress / h.challenge.target_value) * 100)),
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
