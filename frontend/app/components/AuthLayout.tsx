/**
 * Auth Layout Component
 * Split-screen layout for login/signup pages with feature panel
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Music } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  rightPanel: ReactNode;
}

export function AuthLayout({ children, title, subtitle, rightPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-950 flex font-sans text-neutral-200">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative z-20 bg-neutral-950">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-12">
            <Music className="w-8 h-8 text-[#ccff00]" />
            <span className="text-2xl font-bold text-white">Vwaza</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-neutral-400">{subtitle}</p>
        </div>
        {children}
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center p-12 border-l border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-900 to-black z-0" />
        <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
          <div className="w-96 h-96 bg-[#ccff00] rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 w-full flex justify-center">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ccff00]/10 text-[#ccff00]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  );
}

// Re-export Card from ui.tsx for convenience
export { Card } from './ui';
