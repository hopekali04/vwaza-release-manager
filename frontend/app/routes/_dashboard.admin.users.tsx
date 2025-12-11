/**
 * Admin Users Page - Coming Soon
 */

import React from 'react';
import { Link } from 'react-router';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="p-12 text-center space-y-4 bg-neutral-900/50 border border-white/5 rounded-xl animate-in fade-in duration-500">
      <Users className="w-12 h-12 mx-auto text-[#ccff00] opacity-70" />
      <h3 className="text-2xl font-bold text-white">User Management</h3>
      <p className="text-neutral-400">Manage users and permissions here.</p>
      <Link to="/admin" className="inline-block text-sm text-[#ccff00] hover:underline">
        ← Back to Admin Dashboard
      </Link>
    </div>
  );
}
