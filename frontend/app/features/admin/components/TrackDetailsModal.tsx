import { Modal } from '~/components/Modal';
import type { Track } from '~/features/releases';
import { Button } from '~/components/ui';

interface TrackDetailsModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrackDetailsModal({ track, isOpen, onClose }: TrackDetailsModalProps) {
  if (!track) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Track Details">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</label>
            <p className="text-lg font-medium text-white mt-1">{track.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">ISRC</label>
              <p className="text-sm text-white mt-1 font-mono">{track.isrc || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</label>
              <p className="text-sm text-white mt-1">{formatDuration(track.durationSeconds)}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Track Order</label>
            <p className="text-sm text-white mt-1">#{track.trackOrder}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Audio Preview</label>
            <div className="mt-2 bg-neutral-800/50 p-4 rounded-lg border border-white/5">
              {track.audioFileUrl ? (
                <audio
                  controls
                  src={track.audioFileUrl}
                  className="w-full h-10"
                  controlsList="nodownload"
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p className="text-sm text-red-400">No audio file available</p>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Review the audio quality and content before approving.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
