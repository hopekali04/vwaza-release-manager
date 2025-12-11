/**
 * Auth Feature Type Definitions
 * Centralized types for authentication feature
 */

export type UserRole = "ARTIST" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  artistName?: string;
}

export interface SignUpRequestDto {
  email: string;
  password: string;
  artistName?: string;
  role?: UserRole;
}

export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: SignInRequestDto) => Promise<void>;
  signup: (data: SignUpRequestDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  error: string | null;
  clearError: () => void;
}
