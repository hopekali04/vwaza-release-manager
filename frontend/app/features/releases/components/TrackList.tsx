import React from 'react';
import { Button } from '~/components/ui';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import type { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  onDelete?: (id: string) => void;
  onEdit?: (track: Track) => void;
  editable?: boolean;
}

export function TrackList({ tracks, onDelete, onEdit, editable = true }: TrackListProps) {
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
        <p className="text-neutral-400">No tracks added yet</p>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedTracks = [...tracks].sort((a, b) => a.trackOrder - b.trackOrder);

  return (
    <div className="space-y-2">
      {sortedTracks.map((track, index) => (
        <div
          key={track.id}
          className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-neutral-900/70 transition-all"
        >
          <div className="flex items-center space-x-4 flex-1">
            <span className="text-neutral-500 font-medium w-8 text-center">{index + 1}</span>
            
            <div className="flex-1">
              <h4 className="font-medium text-white">{track.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-neutral-500 mt-1">
                <span>{formatDuration(track.durationSeconds)}</span>
                {track.isrc && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-400">ISRC: {track.isrc}</span>
                  </>
                )}
              </div>
            </div>

            {track.audioFileUrl ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-400">Audio uploaded</span>
              </div>
            ) : (
              <span className="text-sm text-orange-400">No audio</span>
            )}
          </div>

          {editable && (
            <div className="flex items-center space-x-2 ml-4">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(track)}>
                  Edit
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDeleteId(track.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this track?"
        description="This action removes the track from the release and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!pendingDeleteId || !onDelete) return;
          setIsDeleting(true);
          try {
            await Promise.resolve(onDelete(pendingDeleteId));
          } finally {
            setIsDeleting(false);
            setPendingDeleteId(null);
          }
        }}
        onClose={() => {
          if (isDeleting) return;
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
