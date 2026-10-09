import { z } from 'zod';

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    role: z.enum(['USER', 'ADMIN', 'COACH']).optional(),
    is_active: z.boolean().optional(),
    status: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(['USER', 'ADMIN', 'COACH']),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    is_active: z.boolean().optional(),
    active: z.boolean().optional(),
    status: z.string().optional(),
  }),
});

export const createUserAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  }),
});

export const updateSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
  body: z.object({
    value: z.string(),
    description: z.string().optional(),
  }),
});
