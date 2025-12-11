/**
 * Reusable UI Components
 * Clean, minimal design components matching the project aesthetic
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'google';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#ccff00] text-black hover:bg-[#b3e600] focus:ring-[#ccff00]",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 focus:ring-neutral-500",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    google: "bg-white text-neutral-800 hover:bg-neutral-100 focus:ring-neutral-300 font-medium",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        className={`w-full bg-neutral-900 border ${error ? 'border-red-500' : 'border-neutral-800'} text-white text-sm rounded-lg px-3 py-2.5 placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className = '' }: BadgeProps) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    DRAFT: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  
  const defaultStyle = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status] || defaultStyle} ${className}`}>
      {status}
    </span>
  );
}

// Card Component
interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// Alert Component
interface AlertProps {
  variant?: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const variants = {
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Google Icon
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
