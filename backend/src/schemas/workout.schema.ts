import { z } from 'zod';

export const createWorkoutSchema = z.object({
  body: z.object({
    type: z.string().min(2, 'Workout type is required').max(50),
    duration_minutes: z
      .number({ invalid_type_error: 'Duration must be a number' })
      .int('Duration must be a whole number of minutes')
      .positive('Duration must be greater than 0 minutes')
      .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)'),
    intensity: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
      errorMap: () => ({ message: 'Intensity must be LOW, MEDIUM, or HIGH' }),
    }),
    calories_burned: z
      .number({ invalid_type_error: 'Calories must be a number' })
      .int('Calories must be an integer')
      .min(0, 'Calories burned cannot be negative')
      .max(20000, 'Calories burned exceeds realistic single session limit (20,000 kcal)'),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date string' })
      .optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  }),
});

export const updateWorkoutSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workout log ID'),
  }),
  body: z.object({
    type: z.string().min(2).max(50).optional(),
    duration_minutes: z
      .number()
      .int()
      .positive('Duration must be greater than 0 minutes')
      .max(1440)
      .optional(),
    intensity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    calories_burned: z
      .number()
      .int()
      .min(0)
      .max(20000)
      .optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date string' })
      .optional(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const queryWorkoutsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    page: z.coerce.number().int().min(1).optional().default(1),
  }),
});
