/**
 * Auth Feature Type Definitions
 * Re-exports shared types + feature-specific types
 */

import {
  UserRole,
  type SignUpRequestDto,
  type SignInRequestDto,
  type AuthResponseDto,
} from "@vwaza/shared";

// Re-export shared types
export { UserRole };
export type { SignUpRequestDto, SignInRequestDto, AuthResponseDto };

// User type (matches AuthResponseDto.user)
export interface User {
  id: string;
  email: string;
  role: UserRole;
  artistName?: string;
}

// Feature-specific context type (not in shared - only used by React)
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
