/**
 * Admin Overview Component
 * Main admin dashboard with system stats
 */

import React from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui';
import { Users, Disc, AlertCircle, TrendingUp } from 'lucide-react';

export function AdminOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h2>
        <p className="text-neutral-400 mt-1">System statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Users', 
            value: '1,247', 
            change: '+45 this week', 
            icon: Users,
            color: 'text-blue-400'
          },
          { 
            label: 'Total Releases', 
            value: '3,891', 
            change: '+123 this month', 
            icon: Disc,
            color: 'text-[#ccff00]'
          },
          { 
            label: 'Pending Reviews', 
            value: '28', 
            change: 'Needs attention', 
            icon: AlertCircle,
            color: 'text-yellow-400',
            link: '/admin/approvals'
          },
          { 
            label: 'Total Streams', 
            value: '5.2M', 
            change: '+18% vs last month', 
            icon: TrendingUp,
            color: 'text-green-400'
          },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.change}</p>
            {stat.link && (
              <Link
                to={stat.link}
                className="mt-3 text-xs text-[#ccff00] hover:underline inline-block"
              >
                View Queue →
              </Link>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/approvals"
            className="p-6 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/70 transition-colors"
          >
            <AlertCircle className="w-6 h-6 text-yellow-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Review Submissions</h4>
            <p className="text-sm text-neutral-400">28 releases pending approval</p>
          </Link>

          <Link
            to="/admin/users"
            className="p-6 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/70 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Manage Users</h4>
            <p className="text-sm text-neutral-400">View and manage all users</p>
          </Link>

          <Link
            to="/settings"
            className="p-6 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/70 transition-colors"
          >
            <Disc className="w-6 h-6 text-[#ccff00] mb-3" />
            <h4 className="font-semibold text-white mb-1">View All Releases</h4>
            <p className="text-sm text-neutral-400">Browse entire release catalog</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
