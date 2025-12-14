import { Link } from 'react-router';
import type { Release } from '../types';
import { Button } from '~/components/ui';

interface ReleaseListProps {
  releases: Release[];
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
  showActions?: boolean;
}

const statusColors = {
  DRAFT: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  PENDING_REVIEW: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  PUBLISHED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function ReleaseList({ releases, onDelete, onSubmit, showActions = true }: ReleaseListProps) {
  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400 mb-4">No releases found</p>
        <Link to="/dashboard/releases/new">
          <Button>Create Your First Release</Button>
        </Link>
      </div>
    );
  }

  return (
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
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <span className="text-neutral-500 text-xs">No Cover</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{release.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[release.status]}`}>
                    {release.status}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-400 mb-2">{release.genre}</p>
                
                <div className="flex items-center space-x-4 text-sm text-neutral-500">
                  <span>{release.trackCount || 0} tracks</span>
                  <span>•</span>
                  <span>Updated {new Date(release.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2 ml-4">
                <Link to={`/dashboard/releases/${release.id}`}>
                  <Button variant="secondary">View</Button>
                </Link>
                
                {release.status === 'DRAFT' && onSubmit && (
                  <Button
                    variant="primary"
                    
                    onClick={() => onSubmit(release.id)}
                  >
                    Submit
                  </Button>
                )}
                
                {release.status === 'DRAFT' && onDelete && (
                  <Button
                    variant="danger"
                    
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this release?')) {
                        onDelete(release.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
