import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/auth.schema.js';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Protected routes (Any authenticated user)
router.get('/me', authenticateToken, getMe);
router.patch('/profile', authenticateToken, validateRequest(updateProfileSchema), updateProfile);
router.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), changePassword);

export default router;
