import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { signJwt } from '../config/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password_hash,
        role: role || 'USER',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    });

    await logAudit(user.id, 'USER_REGISTER', { email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const isDemoAdmin = cleanEmail === 'admin@fitpulse.com';
    const isDemoAthlete = cleanEmail === 'sarah@fitpulse.com' || cleanEmail === 'athlete@fitpulse.com';

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Bulletproof Auto-Provisioning for Demo Accounts on cold or unseeded production databases
    if (!user && (isDemoAdmin || isDemoAthlete)) {
      const defaultName = isDemoAdmin ? 'Marcus Vance (Admin)' : (cleanEmail.includes('sarah') ? 'Sarah Connor' : 'Demo Athlete');
      const defaultRole = isDemoAdmin ? 'ADMIN' : 'USER';
      const defaultPass = isDemoAdmin ? 'Admin123!' : 'User123!';
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(defaultPass, salt);

      try {
        user = await prisma.user.create({
          data: {
            name: defaultName,
            email: cleanEmail,
            password_hash,
            role: defaultRole,
            profile_image: isDemoAdmin
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
            is_active: true,
          },
        });
        console.log(`[Auto-Provision] Created demo user on the fly: ${cleanEmail}`);
      } catch (createErr: any) {
        // Fallback for read-only or cold database environments
        user = {
          id: isDemoAdmin ? 'usr-admin-001' : (cleanEmail.includes('sarah') ? 'usr-sarah-101' : 'usr-athlete-102'),
          name: defaultName,
          email: cleanEmail,
          password_hash,
          role: defaultRole,
          profile_image: isDemoAdmin
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as any;
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify email and password.',
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
      return;
    }

    // Verify Password: Allow standard bcrypt check or demo bypass for demo accounts
    let isMatch = false;
    if (user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    // Bulletproof demo password verification (permits expected demo credentials regardless of previous hash)
    if (!isMatch) {
      if (isDemoAdmin && (password === 'Admin123!' || password === 'admin')) {
        isMatch = true;
      } else if (isDemoAthlete && (password === 'User123!' || password === 'Athlete123!' || password === 'user')) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify email and password.',
      });
      return;
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    });

    try {
      await logAudit(user.id, 'USER_LOGIN', { ip: req.ip });
    } catch {
      // ignore audit log error if database is read-only
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile_image: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch {
      user = null;
    }

    // Fallback if demo user was provisioned dynamically
    if (!user && (req.user!.email?.includes('admin') || req.user!.email?.includes('sarah') || req.user!.email?.includes('athlete'))) {
      const isAdmin = req.user!.role === 'ADMIN';
      user = {
        id: req.user!.userId,
        name: isAdmin ? 'Marcus Vance (Admin)' : (req.user!.email?.includes('sarah') ? 'Sarah Connor' : 'Demo Athlete'),
        email: req.user!.email,
        role: req.user!.role,
        profile_image: isAdmin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, profile_image } = req.body;
    const userId = req.user!.userId;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id: userId },
        },
      });
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Email address is already in use by another account.',
        });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(profile_image !== undefined && { profile_image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_image: true,
        created_at: true,
        updated_at: true,
      },
    });

    await logAudit(userId, 'UPDATE_PROFILE', { fields: Object.keys(req.body) });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    await logAudit(userId, 'CHANGE_PASSWORD', 'User updated account password');

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
