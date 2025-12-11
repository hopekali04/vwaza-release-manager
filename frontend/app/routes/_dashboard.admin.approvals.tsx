/**
 * Admin Approval Queue
 * View and manage releases pending review
 */

import React from 'react';
import { Card, Badge } from '~/components/ui';
import { CheckCircle, XCircle } from 'lucide-react';

// Mock data - will be replaced with real API calls
const MOCK_PENDING_RELEASES = [
  { 
    id: '4', 
    title: 'Neon Nights', 
    artist: 'Cyberpunk Collective', 
    status: 'PENDING_REVIEW', 
    date: '2024-12-20', 
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
    tracks: 12
  },
  { 
    id: '5', 
    title: 'Acoustic Soul', 
    artist: 'Sarah Jenkins', 
    status: 'PENDING_REVIEW', 
    date: '2024-12-22', 
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
    tracks: 8
  },
];

export default function AdminApprovals() {
  const handleApprove = (releaseId: string) => {
    // TODO: Implement approve API call
    alert(`Approving release ${releaseId}`);
  };

  const handleReject = (releaseId: string) => {
    // TODO: Implement reject API call
    alert(`Rejecting release ${releaseId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Approval Queue</h2>
          <p className="text-neutral-400 mt-1">Review and approve artist submissions</p>
        </div>
      </div>

      {/* Pending Releases */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-6">
          Pending Releases ({MOCK_PENDING_RELEASES.length})
        </h3>

        <div className="space-y-4">
          {MOCK_PENDING_RELEASES.map((release) => (
            <Card key={release.id} className="p-6">
              <div className="flex items-start gap-6">
                <img
                  src={release.coverUrl}
                  alt={release.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{release.title}</h4>
                      <p className="text-sm text-neutral-400">by {release.artist}</p>
                    </div>
                    <Badge status={release.status} />
                  </div>

                  <div className="flex items-center gap-6 text-sm text-neutral-400 mb-4">
                    <span>{release.tracks} tracks</span>
                    <span>Submitted: {release.date}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(release.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(release.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
