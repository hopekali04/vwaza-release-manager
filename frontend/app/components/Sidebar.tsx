/**
 * Sidebar Navigation Component
 * Role-based navigation for Artist and Admin dashboards
 */

import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '~/features/auth';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User, 
  Shield, 
  TrendingUp, 
  Disc,
  Music 
} from 'lucide-react';

export function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const artistLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/releases', label: 'My Releases', icon: Disc },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/approvals', label: 'Approval Queue', icon: Shield },
    { path: '/admin/users', label: 'User Management', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : artistLinks;

  return (
    <aside className="w-64 bg-neutral-950 border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-[#ccff00]" />
          <span className="text-xl font-bold text-white">Vwaza</span>
          {user?.role === 'ADMIN' && (
            <span className="ml-auto text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded-full border border-[#ccff00]/20">
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#ccff00]/10 text-[#ccff00]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.artistName || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
