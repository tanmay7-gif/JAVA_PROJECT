import { Router } from 'express';
import {
  getDashboardKPIs,
  getAdminStatistics,
  listUsers,
  createUserByAdmin,
  updateUserByAdmin,
  updateUserRole,
  toggleUserStatus,
  deleteUserByAdmin,
  getSystemSettings,
  updateSystemSetting,
  getAuditLogs,
  getActivityStats,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createUserAdminSchema,
  updateUserSchema,
  updateRoleSchema,
  updateStatusSchema,
  updateSettingSchema,
} from '../schemas/admin.schema.js';

const router = Router();

// All admin routes strictly enforce authenticateToken + requireRole('ADMIN')
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Telemetry & Platform Statistics
router.get('/dashboard', getDashboardKPIs);
router.get('/statistics', getAdminStatistics);

// User Management
router.get('/users', listUsers);
router.post('/users', validateRequest(createUserAdminSchema), createUserByAdmin);
router.patch('/users/:id', validateRequest(updateUserSchema), updateUserByAdmin);
router.put('/users/:id', validateRequest(updateUserSchema), updateUserByAdmin);
router.patch('/users/:id/role', validateRequest(updateRoleSchema), updateUserRole);
router.patch('/users/:id/status', validateRequest(updateStatusSchema), toggleUserStatus);
router.delete('/users/:id', deleteUserByAdmin);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings/:key', validateRequest(updateSettingSchema), updateSystemSetting);
router.post('/settings', updateSystemSetting);

// Activity Monitoring & Audit Streams
router.get('/audit-logs', getAuditLogs);
router.get('/activity-logs', getAuditLogs);
router.get('/activity-stats', getActivityStats);

export default router;
