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
    return <div className="text-center py-12 text-gray-500">Loading pending releases...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Approvals</h2>
        <Button variant="outline" onClick={fetchPendingReleases}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {releases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No releases pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((release) => (
            <div
              key={release.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {release.coverArtUrl ? (
                    <img
                      src={release.coverArtUrl}
                      alt={release.title}
                      className="w-24 h-24 rounded object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Cover</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{release.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{release.genre}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
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
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-3">Tracks</h4>
                  {loadingTracks[release.id] ? (
                    <div className="text-sm text-gray-500">Loading tracks...</div>
                  ) : (
                    <div className="space-y-2">
                      {tracks[release.id]?.map((track) => (
                        <div key={track.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm w-6">{track.trackOrder}</span>
                            <span className="font-medium">{track.title}</span>
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
