import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded even if this module is imported before index.ts
dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET || 'fitpulse_super_secure_jwt_secret_key_2026_xyz!';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
