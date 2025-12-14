/**
 * Artist Dashboard Stats Component
 * Dashboard overview for artists
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, Badge } from '~/components/ui';
import { Plus, TrendingUp, Disc, Music, Clock } from 'lucide-react';
import { releaseService, ReleaseStatus } from '~/features/releases';
import type { Release } from '~/features/releases';

export function DashboardStats() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const data = await releaseService.getReleases();
        setReleases(data);
      } catch (error) {
        console.error('Failed to fetch releases', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReleases();
  }, []);

  const stats = {
    total: releases.length,
    draft: releases.filter(r => r.status === ReleaseStatus.DRAFT).length,
    processing: releases.filter(r => r.status === ReleaseStatus.PROCESSING).length,
    pending: releases.filter(r => r.status === ReleaseStatus.PENDING_REVIEW).length,
    published: releases.filter(r => r.status === ReleaseStatus.PUBLISHED).length,
    totalTracks: releases.reduce((acc, r) => acc + (r.trackCount || 0), 0),
  };

  const recentReleases = [...releases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-neutral-400 mt-1">Welcome back, manage your music releases</p>
        </div>
        <Link
          to="/dashboard/releases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ccff00] text-black rounded-lg font-medium text-sm hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Release
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Releases</h3>
            <Disc className="w-5 h-5 text-[#ccff00]" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Published</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.published}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">In Review</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.pending + stats.processing}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Tracks</h3>
            <Music className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalTracks}</p>
        </Card>
      </div>

      {/* Recent Releases */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Releases</h3>
          <Link to="/dashboard/releases" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
            View All
          </Link>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-neutral-400">Loading releases...</p>
          </Card>
        ) : releases.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-neutral-400 mb-4">You haven't created any releases yet</p>
            <Link
              to="/dashboard/releases/new"
              className="inline-block px-4 py-2 bg-[#ccff00] text-neutral-950 rounded-lg font-medium hover:bg-[#ccff00]/90 transition-colors"
            >
              Create Your First Release
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentReleases.map((release) => (
              <Link key={release.id} to={`/dashboard/releases/${release.id}`}>
                <Card className="p-4 hover:bg-neutral-900/70 transition-colors">
                  <div className="flex items-center gap-4">
                    {release.coverArtUrl ? (
                      <img
                        src={release.coverArtUrl}
                        alt={release.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center">
                        <Disc className="w-8 h-8 text-neutral-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{release.title}</h4>
                      <p className="text-sm text-neutral-400">{release.genre}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{release.trackCount || 0} tracks</p>
                        <p className="text-xs text-neutral-500">{new Date(release.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <Badge status={release.status} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
