import { useState, useEffect } from 'react';
import { Button } from '~/components/ui';
import type { Release, Track } from '~/features/releases';
import { releaseService, PaginatedReleasesResponse } from '~/features/releases';
import { ChevronDown, ChevronUp, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrackDetailsModal } from './TrackDetailsModal';

type ViewMode = 'pending' | 'all';

export function AdminApprovalPanel() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('pending');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  // Track playback state
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Record<string, Track[]>>({});
  const [loadingTracks, setLoadingTracks] = useState<Record<string, boolean>>({});

  // Modal state
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReleases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit,
        ...(viewMode === 'pending' && { status: 'PENDING_REVIEW' }),
      };
      const response: PaginatedReleasesResponse = await releaseService.getReleases(params);
      setReleases(response.releases);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
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

  const handleViewTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
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

  // Auto-fetch on mount and when view mode or page changes
  useEffect(() => {
    fetchReleases();
  }, [viewMode, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setExpandedReleaseId(null); // Close expanded releases on page change
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1); // Reset to first page when switching views
    setExpandedReleaseId(null);
  };

  if (isLoading && releases.length === 0) {
    return <div className="text-center py-12 text-neutral-400">Loading releases...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Release Management</h2>
          <p className="text-neutral-400 mt-1">Review and manage releases</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchReleases}>
            Refresh
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-2">
        <Button
          variant={viewMode === 'pending' ? 'primary' : 'ghost'}
          onClick={() => handleViewModeChange('pending')}
          className="flex-1 text-base font-medium"
        >
          Pending Approvals
          {viewMode === 'pending' && total > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-sm">{total}</span>
          )}
        </Button>
        <Button
          variant={viewMode === 'all' ? 'primary' : 'ghost'}
          onClick={() => handleViewModeChange('all')}
          className="flex-1 text-base font-medium"
        >
          All Releases
          {viewMode === 'all' && total > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-sm">{total}</span>
          )}
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
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewTrack(track)}
                              className="text-neutral-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4">
          <div className="text-sm text-neutral-400">
            Showing page {currentPage} of {totalPages} ({total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[2.5rem]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <TrackDetailsModal 
        track={selectedTrack}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
