import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../config/jwt.js';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid format.',
    });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token || token === 'undefined' || token === 'null') {
    res.status(401).json({
      success: false,
      message: 'Token is undefined or null. Please log in again.',
    });
    return;
  }

  try {
    const decoded = verifyJwt(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid, malformed, or expired token. Authentication failed.',
    });
    return;
  }
};

export const requireRole = (...roles: Array<'USER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles.`,
      });
      return;
    }

    next();
  };
};
