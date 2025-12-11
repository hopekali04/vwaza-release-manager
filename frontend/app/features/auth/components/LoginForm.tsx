/**
 * Login Form Component
 * Reusable form for user authentication
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button, Input, GoogleIcon, Alert } from '~/components/ui';
import type { SignInRequestDto } from '../types';

interface LoginFormProps {
  onSubmit: (data: SignInRequestDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

export function LoginForm({ onSubmit, isLoading = false, error, onErrorClear }: LoginFormProps) {
  const [formData, setFormData] = useState<SignInRequestDto>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<SignInRequestDto>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof SignInRequestDto]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear API error when user starts typing
    if (error && onErrorClear) onErrorClear();
  };

  const validate = (): boolean => {
    const errors: Partial<SignInRequestDto> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-8">
        {/* Google Sign In */}
        <Button 
          variant="google" 
          className="w-full gap-2 h-11 mb-6" 
          onClick={() => alert("Google OAuth would be implemented here")}
        >
          <GoogleIcon />
          Sign in with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="artist@example.com"
            error={validationErrors.email}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={validationErrors.password}
            disabled={isLoading}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-neutral-400">
              <input type="checkbox" className="mr-2 rounded border-neutral-700" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#ccff00] hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-11" 
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#ccff00] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg">
        <p className="text-xs text-neutral-500 mb-2 font-medium">Demo Credentials:</p>
        <div className="text-xs text-neutral-400 space-y-1">
          <p>Artist: <code className="text-[#ccff00]">artist@vwaza.com</code></p>
          <p>Admin: <code className="text-[#ccff00]">admin@vwaza.com</code></p>
          <p>Password: <code className="text-[#ccff00]">Test@123</code></p>
        </div>
      </div>
    </div>
  );
}
