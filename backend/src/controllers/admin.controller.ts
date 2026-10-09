import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AdminService } from '../services/admin.service.js';
import { ActivityService } from '../services/activity.service.js';

/**
 * Controller handling Administrator governance and platform telemetry endpoints.
 * Demonstrates Controller -> Service separation.
 */

export const getDashboardKPIs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AdminService.getKPIs();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await AdminService.getPlatformStatistics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role, status, is_active, page, limit, sortBy, sortOrder } = req.query as any;
    const result = await AdminService.listUsers({
      search,
      role,
      status: status || (is_active !== undefined ? (is_active === 'true' ? 'ACTIVE' : 'SUSPENDED') : undefined),
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || 'created_at',
      sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc'),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createUserByAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const user = await AdminService.createUser(adminId, req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const updateUserByAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const updated = await AdminService.updateUser(adminId, id, req.body);
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const { role } = req.body;
    const updated = await AdminService.updateUserRole(adminId, id, role);
    res.status(200).json({
      success: true,
      message: `User role elevated/demoted to ${role}.`,
      data: updated,
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const { is_active, active, status } = req.body;

    const resolvedActive =
      is_active !== undefined
        ? Boolean(is_active)
        : active !== undefined
        ? Boolean(active)
        : status
        ? status.toUpperCase() === 'ACTIVE'
        : false;

    const updated = await AdminService.toggleUserStatus(adminId, id, resolvedActive);
    res.status(200).json({
      success: true,
      message: `User account is now ${resolvedActive ? 'Active' : 'Suspended'}.`,
      data: updated,
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const deleteUserByAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    await AdminService.deleteUser(adminId, id);
    res.status(200).json({
      success: true,
      message: 'User deleted permanently.',
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getSystemSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const settings = await AdminService.getSystemSettings(adminId);
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSetting = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { key } = req.params;
    const { value, description } = req.body;
    const settingKey = key || req.body.key;

    if (!settingKey) {
      res.status(400).json({ success: false, message: 'Setting key is required.' });
      return;
    }

    const setting = await AdminService.updateSystemSetting(adminId, settingKey, value, description);
    res.status(200).json({
      success: true,
      message: `System setting "${settingKey}" updated successfully.`,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = 50, page = 1, action, search, q } = req.query as any;
    const result = await ActivityService.getLogs({
      action,
      search: search || q,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await ActivityService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
