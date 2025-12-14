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
  DRAFT: 'bg-gray-100 text-gray-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function ReleaseList({ releases, onDelete, onSubmit, showActions = true }: ReleaseListProps) {
  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No releases found</p>
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
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {release.coverArtUrl ? (
                <img
                  src={release.coverArtUrl}
                  alt={release.title}
                  className="w-20 h-20 rounded object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Cover</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{release.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[release.status]}`}>
                    {release.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{release.genre}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
