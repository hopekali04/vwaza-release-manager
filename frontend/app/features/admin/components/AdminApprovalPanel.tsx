import { useState, useEffect } from 'react';
import { Button } from '~/components/ui';
import type { Release, Track } from '~/features/releases';
import { releaseService } from '~/features/releases';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AdminApprovalPanel() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track playback state
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Record<string, Track[]>>({});
  const [loadingTracks, setLoadingTracks] = useState<Record<string, boolean>>({});

  const fetchPendingReleases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allReleases = await releaseService.getReleases();
      const pending = allReleases.filter(r => r.status === 'PENDING_REVIEW');
      setReleases(pending);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch releases');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = async (releaseId: string) => {
    if (expandedReleaseId === releaseId) {
      setExpandedReleaseId(null);
      return;
    }

    setExpandedReleaseId(releaseId);
    
    if (!tracks[releaseId]) {
      setLoadingTracks(prev => ({ ...prev, [releaseId]: true }));
      try {
        const releaseTracks = await releaseService.getTracks(releaseId);
        setTracks(prev => ({ ...prev, [releaseId]: releaseTracks }));
      } catch (err) {
        console.error('Failed to fetch tracks', err);
      } finally {
        setLoadingTracks(prev => ({ ...prev, [releaseId]: false }));
      }
    }
  };

  const handleApprove = async (id: string) => {
    setError(null);
    try {
      await releaseService.approveRelease(id);
      setReleases(releases.filter(r => r.id !== id));
      if (expandedReleaseId === id) setExpandedReleaseId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to approve release');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this release?')) return;
    
    setError(null);
    try {
      await releaseService.rejectRelease(id);
      setReleases(releases.filter(r => r.id !== id));
      if (expandedReleaseId === id) setExpandedReleaseId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject release');
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchPendingReleases();
  }, []);

  if (isLoading && releases.length === 0) {
    return <div className="text-center py-12 text-neutral-400">Loading pending releases...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Pending Approvals</h2>
          <p className="text-neutral-400 mt-1">Review and approve artist releases</p>
        </div>
        <Button variant="secondary" onClick={fetchPendingReleases}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {releases.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
          <p className="text-neutral-400">No releases pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((release) => (
            <div
              key={release.id}
              className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:bg-neutral-900/70 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {release.coverArtUrl ? (
                    <img
                      src={release.coverArtUrl}
                      alt={release.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <span className="text-neutral-500 text-xs">No Cover</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{release.title}</h3>
                    <p className="text-sm text-neutral-400 mb-2">{release.genre}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-3">
                      <span>{release.trackCount || 0} tracks</span>
                      <span>•</span>
                      <span>Submitted {new Date(release.updatedAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(release.id)}
                      >
                        ✓ Approve
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(release.id)}
                      >
                        ✗ Reject
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(release.id)}
                      >
                        {expandedReleaseId === release.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" /> Hide Tracks
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> Review Tracks
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracks Section */}
              {expandedReleaseId === release.id && (
                <div className="mt-6 border-t border-white/5 pt-4">
                  <h4 className="font-medium text-white mb-3">Tracks</h4>
                  {loadingTracks[release.id] ? (
                    <div className="text-sm text-neutral-400">Loading tracks...</div>
                  ) : (
                    <div className="space-y-2">
                      {tracks[release.id]?.map((track) => (
                        <div key={track.id} className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-500 text-sm w-6">{track.trackOrder}</span>
                            <span className="font-medium text-white">{track.title}</span>
                          </div>
                          
                          {track.audioFileUrl && (
                            <div className="flex items-center gap-2">
                              <audio
                                controls
                                src={track.audioFileUrl}
                                className="h-8 w-64"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
