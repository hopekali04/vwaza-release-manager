/**
 * Dashboard Layout
 * Protected layout with sidebar navigation
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/features/auth';
import { Sidebar } from '~/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    // Wait until auth state is confirmed
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      navigate('/login');
    } else {
      // Role-based dashboard routing
      if (user?.role === 'ADMIN' && location.pathname === '/dashboard') {
        navigate('/dashboard/admin');
      } else if (user?.role === 'ARTIST' && location.pathname.startsWith('/dashboard/admin')) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAuthReady, navigate, user, location.pathname]);

  // Show loading state while checking auth
  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`${isSidebarCollapsed ? 'pl-32' : 'pl-80'} pr-8 py-8 transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
}
