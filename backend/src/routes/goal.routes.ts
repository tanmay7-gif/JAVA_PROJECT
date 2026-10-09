import { Router } from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  incrementGoalProgress,
  abandonGoal,
} from '../controllers/goal.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All goal operations require authentication
router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/increment', incrementGoalProgress);
router.post('/:id/abandon', abandonGoal);

export default router;
