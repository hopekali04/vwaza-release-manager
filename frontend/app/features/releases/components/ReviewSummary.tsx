import { Button } from '~/components/ui';
import type { Release, Track } from '../types';

interface ReviewSummaryProps {
  release: Release;
  tracks: Track[];
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
}

export function ReviewSummary({ release, tracks, onSubmit, isSubmitting }: ReviewSummaryProps) {
  const totalDuration = tracks.reduce((sum, t) => sum + (t.durationSeconds || 0), 0);

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Review & Submit</h2>
      <p className="text-neutral-400 mb-6">Confirm your release details before submitting for review.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-white mb-3">Release Details</h3>
          <div className="space-y-2 text-sm text-neutral-400">
            <div><span className="font-medium text-white">Title:</span> {release.title}</div>
            <div><span className="font-medium text-white">Genre:</span> {release.genre}</div>
            <div><span className="font-medium text-white">Tracks:</span> {tracks.length}</div>
            <div><span className="font-medium text-white">Total Duration:</span> {Math.round(totalDuration / 60)} min</div>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-white mb-3">Cover Art</h3>
          {release.coverArtUrl ? (
            <img src={release.coverArtUrl} alt={release.title} className="w-48 h-48 object-cover rounded-lg border border-white/10" />
          ) : (
            <div className="w-48 h-48 bg-neutral-800 rounded-lg border border-white/10 flex items-center justify-center text-neutral-500 text-sm">
              No cover art
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-white mb-3">Track List</h3>
        <div className="space-y-2">
          {tracks.map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-neutral-800/50 border border-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-neutral-500 text-sm w-6">{t.trackOrder}</span>
                <span className="font-medium text-white">{t.title}</span>
              </div>
              <span className="text-xs text-neutral-500">{Math.round((t.durationSeconds || 0))}s</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit for Review'}
        </Button>
      </div>
    </div>
  );
}
