/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient, type ApiError } from '~/lib/api';

// Types matching backend auth schema
export interface SignUpRequestDto {
  email: string;
  password: string;
  artistName?: string;
  role?: 'ARTIST' | 'ADMIN';
}

export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'ARTIST' | 'ADMIN';
    artistName?: string;
  };
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpRequestDto): Promise<AuthResponseDto> {
    try {
      const response = await apiClient.post<AuthResponseDto>('/api/auth/signup', data);
      this.storeAuthData(response);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInRequestDto): Promise<AuthResponseDto> {
    try {
      const response = await apiClient.post<AuthResponseDto>('/api/auth/signin', data);
      this.storeAuthData(response);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('vwaza_token');
    localStorage.removeItem('vwaza_user');
  },

  /**
   * Get the stored user data
   */
  getCurrentUser(): AuthResponseDto['user'] | null {
    const userStr = localStorage.getItem('vwaza_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('vwaza_token');
  },

  /**
   * Store authentication data in localStorage
   */
  storeAuthData(response: AuthResponseDto): void {
    localStorage.setItem('vwaza_token', response.accessToken);
    localStorage.setItem('vwaza_user', JSON.stringify(response.user));
  },
};
