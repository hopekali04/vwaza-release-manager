/**
 * Releases Page - Coming Soon
 */

import React from 'react';
import { Link } from 'react-router';
import { Disc } from 'lucide-react';

export default function ReleasesPage() {
  return (
    <div className="p-12 text-center space-y-4 bg-neutral-900/50 border border-white/5 rounded-xl animate-in fade-in duration-500">
      <Disc className="w-12 h-12 mx-auto text-[#ccff00] opacity-70" />
      <h3 className="text-2xl font-bold text-white">My Releases</h3>
      <p className="text-neutral-400">View and manage all your releases here.</p>
      <Link to="/dashboard" className="inline-block text-sm text-[#ccff00] hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
