/**
 * Analytics Page - Coming Soon
 */

import React from 'react';
import { Link } from 'react-router';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-12 text-center space-y-4 bg-neutral-900/50 border border-white/5 rounded-xl animate-in fade-in duration-500">
      <BarChart3 className="w-12 h-12 mx-auto text-[#ccff00] opacity-70" />
      <h3 className="text-2xl font-bold text-white">Analytics</h3>
      <p className="text-neutral-400">Detailed analytics and insights coming soon.</p>
      <Link to="/dashboard" className="inline-block text-sm text-[#ccff00] hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
