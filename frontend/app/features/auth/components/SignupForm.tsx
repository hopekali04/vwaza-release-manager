/**
 * Signup Form Component
 * Reusable form for new user registration
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button, Input, GoogleIcon, Alert } from '~/components/ui';
import { showToast } from '~/lib/toast';
import type { SignUpRequestDto } from '../types';

interface SignupFormProps {
  onSubmit: (data: SignUpRequestDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

export function SignupForm({ onSubmit, isLoading = false, error, onErrorClear }: SignupFormProps) {
  const [formData, setFormData] = useState<SignUpRequestDto>({
    email: '',
    password: '',
    artistName: '',
    role: 'ARTIST',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof SignUpRequestDto | 'confirmPassword', string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear API error when user starts typing
    if (error && onErrorClear) onErrorClear();
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof SignUpRequestDto | 'confirmPassword', string>> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation (matching backend requirements)
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain a number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = 'Password must contain a special character';
    }

    // Confirm password
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Artist name (optional but validate if provided)
    if (formData.artistName && formData.artistName.trim().length < 2) {
      errors.artistName = 'Artist name must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    try {
      await onSubmit(formData);
      showToast({
        variant: 'success',
        title: 'Account Created',
        message: 'Welcome to Vwaza! Your account has been created successfully.'
      });
    } catch (err) {
      // Extract error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
      
      // Show specific error toast
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
        showToast({
          variant: 'error',
          title: 'Email Already Registered',
          message: 'This email is already associated with an account. Try logging in instead.'
        });
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        showToast({
          variant: 'error',
          title: 'Too Many Attempts',
          message: 'Please wait a few minutes before trying again.'
        });
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        showToast({
          variant: 'error',
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.'
        });
      } else {
        showToast({
          variant: 'error',
          title: 'Signup Failed',
          message: errorMessage
        });
      }
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

      {/* Signup Form */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-8">
        {/* Google Sign Up */}
        <Button 
          variant="google" 
          className="w-full gap-2 h-11 mb-6" 
          onClick={() => alert("Google OAuth would be implemented here")}
        >
          <GoogleIcon />
          Sign up with Google
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
            placeholder="you@example.com"
            error={validationErrors.email}
            disabled={isLoading}
          />

          <Input
            label="Artist Name (Optional)"
            type="text"
            name="artistName"
            value={formData.artistName}
            onChange={handleChange}
            placeholder="Your stage name"
            error={validationErrors.artistName}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
            error={validationErrors.password}
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={validationErrors.confirmPassword}
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
            >
              <option value="ARTIST">Artist</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-11 mt-6" 
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#ccff00] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
