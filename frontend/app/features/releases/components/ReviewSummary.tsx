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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
      <p className="text-gray-600 mb-6">Confirm your release details before submitting for review.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3">Release Details</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div><span className="font-medium">Title:</span> {release.title}</div>
            <div><span className="font-medium">Genre:</span> {release.genre}</div>
            <div><span className="font-medium">Tracks:</span> {tracks.length}</div>
            <div><span className="font-medium">Total Duration:</span> {Math.round(totalDuration / 60)} min</div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3">Cover Art</h3>
          {release.coverArtUrl ? (
            <img src={release.coverArtUrl} alt={release.title} className="w-48 h-48 object-cover rounded-lg border border-gray-200" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
              No cover art
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-3">Track List</h3>
        <div className="space-y-2">
          {tracks.map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-6">{t.trackOrder}</span>
                <span className="font-medium">{t.title}</span>
              </div>
              <span className="text-xs text-gray-500">{Math.round((t.durationSeconds || 0))}s</span>
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
