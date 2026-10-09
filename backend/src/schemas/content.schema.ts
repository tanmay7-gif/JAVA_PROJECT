import { z } from 'zod';

export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    media_url: z.string().url('Media URL must be a valid URL').optional().nullable(),
  }),
});

export const moderateContentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
    }),
    feedback: z.string().max(500).optional().nullable(),
  }),
});
