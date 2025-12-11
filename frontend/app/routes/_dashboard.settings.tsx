/**
 * Settings Page - Coming Soon
 */

import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Settings, User } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const backPath = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
  
  return (
    <div className="p-12 text-center space-y-4 bg-neutral-900/50 border border-white/5 rounded-xl animate-in fade-in duration-500">
      <Settings className="w-12 h-12 mx-auto text-[#ccff00] opacity-70" />
      <h3 className="text-2xl font-bold text-white">Settings</h3>
      <p className="text-neutral-400">Account settings and preferences coming soon.</p>
      <button 
        onClick={() => navigate(backPath)}
        className="inline-block text-sm text-[#ccff00] hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
