import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workoutRoutes from './workout.routes.js';
import contentRoutes from './content.routes.js';
import challengeRoutes from './challenge.routes.js';
import adminRoutes from './admin.routes.js';
import goalRoutes from './goal.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/content', contentRoutes);
router.use('/challenges', challengeRoutes);
router.use('/goals', goalRoutes);
router.use('/admin', adminRoutes);

export default router;
