import { Router } from 'express';
import {
  createWorkout,
  listWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutAnalytics,
  getEstimate,
} from '../controllers/workout.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  queryWorkoutsSchema,
} from '../schemas/workout.schema.js';

const router = Router();

// All workout routes require authentication
router.use(authenticateToken);

router.get('/', validateRequest(queryWorkoutsSchema), listWorkouts);
router.get('/analytics', getWorkoutAnalytics);
router.get('/estimate-calories', getEstimate);
router.post('/', validateRequest(createWorkoutSchema), createWorkout);
router.put('/:id', validateRequest(updateWorkoutSchema), updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
