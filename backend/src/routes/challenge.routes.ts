import { Router } from 'express';
import {
  listChallenges,
  joinChallenge,
  updateUserChallengeProgress,
  getMyChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  monitorChallenge,
  getChallengeHistory,
} from '../controllers/challenge.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createChallengeSchema } from '../schemas/challenge.schema.js';

const router = Router();

// Allow reading challenges (optional auth to see personal progress)
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticateToken(req as any, res, next);
  }
  next();
}, listChallenges);

// User challenge actions
router.post('/:challengeId/join', authenticateToken, joinChallenge);
router.post('/:challengeId/progress', authenticateToken, updateUserChallengeProgress);
router.get('/my/progress', authenticateToken, getMyChallenges);
router.get('/my/history', authenticateToken, getChallengeHistory);

// Admin-only management
router.post('/admin/create', authenticateToken, requireRole('ADMIN'), validateRequest(createChallengeSchema), createChallenge);
router.put('/admin/:challengeId', authenticateToken, requireRole('ADMIN'), updateChallenge);
router.delete('/admin/:challengeId', authenticateToken, requireRole('ADMIN'), deleteChallenge);
router.get('/admin/:challengeId/monitor', authenticateToken, requireRole('ADMIN'), monitorChallenge);

export default router;
