/**
 * Placeholder View
 * Used for routes that are not yet implemented
 */

import React from 'react';
import { Link } from 'react-router';
import { Globe } from 'lucide-react';

export default function PlaceholderView() {
  return (
    <div className="p-12 text-center space-y-4 bg-neutral-900/50 border border-white/5 rounded-xl animate-in fade-in duration-500">
      <Globe className="w-12 h-12 mx-auto text-[#ccff00] opacity-70" />
      <h3 className="text-2xl font-bold text-white">Coming Soon</h3>
      <p className="text-neutral-400">This feature will be implemented soon.</p>
      <Link to="/dashboard" className="inline-block text-sm text-[#ccff00] hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
