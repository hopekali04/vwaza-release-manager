import { z } from 'zod';
import { UserRole } from '../enums/index.js';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

// Sign up validation
export const signUpRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  artistName: z.string().min(1, 'Artist name is required').optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.ARTIST),
});

// Sign in validation
export const signInRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Refresh token validation
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Type inference
export type SignUpRequestDto = z.infer<typeof signUpRequestSchema>;
export type SignInRequestDto = z.infer<typeof signInRequestSchema>;
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenRequestSchema>;

// Response DTO (not validated, only for typing)
export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    artistName?: string;
  };
}
