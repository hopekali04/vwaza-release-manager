/**
 * Admin Overview Component
 * Main admin dashboard with system stats
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui';
import { Users, Disc, AlertCircle, TrendingUp } from 'lucide-react';
import { releaseService } from '~/features/releases';
import { ReleaseStatus } from '@vwaza/shared';

type AdminStats = {
  totalReleases: number;
  pendingReview: number;
  published: number;
  processing: number;
};

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalReleases: 0,
    pendingReview: 0,
    published: 0,
    processing: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async (status?: ReleaseStatus): Promise<number> => {
    const response = await releaseService.getReleases({ status, limit: 1, page: 1 });
    return response.pagination.total;
  };

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [totalReleases, pendingReview, published, processing] = await Promise.all([
        fetchCount(),
        fetchCount(ReleaseStatus.PENDING_REVIEW),
        fetchCount(ReleaseStatus.PUBLISHED),
        fetchCount(ReleaseStatus.PROCESSING),
      ]);

      setStats({ totalReleases, pendingReview, published, processing });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Releases',
      value: stats.totalReleases.toLocaleString(),
      change: isLoading ? 'Loading…' : 'Across all artists',
      icon: Disc,
      color: 'text-[#ccff00]',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReview.toLocaleString(),
      change: isLoading ? 'Loading…' : 'Awaiting admin action',
      icon: AlertCircle,
      color: 'text-yellow-400',
      link: '/admin/approvals',
    },
    {
      label: 'Processing Releases',
      value: stats.processing.toLocaleString(),
      change: isLoading ? 'Loading…' : 'In ingestion pipeline',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      label: 'Published Releases',
      value: stats.published.toLocaleString(),
      change: isLoading ? 'Loading…' : 'Live in catalog',
      icon: Users,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h2>
        <p className="text-neutral-400 mt-1">System statistics and recent activity</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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
            <p className="text-sm text-neutral-400">
              {isLoading ? 'Loading…' : `${stats.pendingReview} releases pending approval`}
            </p>
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
