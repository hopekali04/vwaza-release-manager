/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '~/services/auth.service';
import type { ApiError } from '~/lib/api';
import type { UserRole, SignUpRequestDto, SignInRequestDto, AuthResponseDto } from '@vwaza/shared';

interface User {
  id: string;
  email: string;
  role: UserRole;
  artistName?: string;
}

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsAuthReady(true);
  }, []);

  const clearError = () => setError(null);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const login = async (data: SignInRequestDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.signIn(data);
      setUser(response.user);
      
      // Redirect based on role
      navigate(response.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignUpRequestDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.signUp(data);
      setUser(response.user);
      
      // Redirect to dashboard after signup
      navigate(response.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout: handleLogout,
    isAuthenticated: !!user,
    isAuthReady,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
