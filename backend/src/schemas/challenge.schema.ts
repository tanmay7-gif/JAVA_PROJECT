import { z } from 'zod';

export const createChallengeSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    target_metric: z.enum(['CALORIES', 'DURATION', 'WORKOUT_COUNT']),
    target_value: z.number().int().positive(),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val))),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val))),
    reward_badge: z.string().min(2),
  }),
});

export const updateProgressSchema = z.object({
  params: z.object({
    challengeId: z.string().uuid(),
  }),
  body: z.object({
    increment: z.number().int().min(0).optional(),
    current_progress: z.number().int().min(0).optional(),
  }),
});
