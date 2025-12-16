import jwt from 'jsonwebtoken';
import { UserRole } from '@vwaza/shared';
import { loadConfig } from '@config/index.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  const config = loadConfig();
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const config = loadConfig();
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '7d', // Refresh tokens valid for 7 days
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const config = loadConfig();
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
