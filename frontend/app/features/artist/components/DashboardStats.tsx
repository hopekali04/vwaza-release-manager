/**
 * Artist Dashboard Stats Component
 * Dashboard overview for artists
 */

import React from 'react';
import { Link } from 'react-router';
import { Card, Badge } from '~/components/ui';
import { Plus, TrendingUp } from 'lucide-react';

// Mock data - will be replaced with real API calls
const MOCK_RELEASES = [
  { 
    id: '1', 
    title: 'Midnight Echoes', 
    status: 'PUBLISHED', 
    date: '2024-12-01', 
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    streams: '12.5K'
  },
  { 
    id: '2', 
    title: 'Solar Flare', 
    status: 'PENDING_REVIEW', 
    date: '2024-12-15', 
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
    streams: '0'
  },
  { 
    id: '3', 
    title: 'Deep Dive', 
    status: 'DRAFT', 
    date: '2025-01-10', 
    coverUrl: 'https://images.unsplash.com/photo-1621644827024-e8a6c91a5432?w=300&h=300&fit=crop',
    streams: '0'
  },
];

export function DashboardStats() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-neutral-400 mt-1">Welcome back, manage your music releases</p>
        </div>
        <Link
          to="/releases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ccff00] text-black rounded-lg font-medium text-sm hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Release
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Streams', value: '124,592', change: '+12.5%', trend: 'up' },
          { label: 'Active Releases', value: '8', change: '+2', trend: 'up' },
          { label: 'Followers', value: '12.8k', change: '+1.1%', trend: 'up' },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Releases */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Releases</h3>
          <Link to="/releases" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {MOCK_RELEASES.map((release) => (
            <Card key={release.id} className="p-4 hover:bg-neutral-900/70 transition-colors">
              <div className="flex items-center gap-4">
                <img
                  src={release.coverUrl}
                  alt={release.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{release.title}</h4>
                  <p className="text-sm text-neutral-400">{release.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{release.streams}</p>
                    <p className="text-xs text-neutral-500">streams</p>
                  </div>
                  <Badge status={release.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
