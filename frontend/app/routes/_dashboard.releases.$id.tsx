import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useRelease, releaseService, FileUpload, TrackList, TrackForm } from '~/features/releases';
import { showToast } from '~/lib/toast';
import { ReviewSummary } from '~/features/releases/components/ReviewSummary';
import type { Track, CreateTrackData } from '~/features/releases';
import { Button } from '~/components/ui';
import { WizardStepper } from '~/features/releases/components/WizardStepper';

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { release, tracks, isLoading, error, uploadCoverArt, setTracks } = useRelease(id);
  
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const notifyError = (message: string) => {
    setActionError(message);
    showToast({
      variant: 'error',
      title: 'Action needed',
      message,
    });
  };

  if (isLoading && !release) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-neutral-400">Loading release...</div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400 mb-4">Release not found</p>
        <Button onClick={() => navigate('/dashboard/releases')}>Back to Releases</Button>
      </div>
    );
  }

  const canEdit = release.status === 'DRAFT';

  const handleCreateTrack = async (data: CreateTrackData) => {
    if (!id) return;
    
    setActionError(null);
    try {
      const newTrack = await releaseService.createTrack(id, data);
      setTracks([...tracks, newTrack]);
      setShowTrackForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create track';
      notifyError(message);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    setActionError(null);
    try {
      await releaseService.deleteTrack(trackId);
      setTracks(tracks.filter(t => t.id !== trackId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete track';
      notifyError(message);
    }
  };

  const handleUploadAudio = async (trackId: string, file: File): Promise<boolean> => {
    setActionError(null);
    try {
      const { url, duration } = await releaseService.uploadAudioFile(trackId, file);
      setTracks(tracks.map(t => 
        t.id === trackId ? { ...t, audioFileUrl: url, durationSeconds: duration } : t
      ));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload audio';
      notifyError(message);
      return false;
    }
  };

  const handleSubmitRelease = async () => {
    if (!id) return;
    
    setActionError(null);
    
    // Validation
    if (!release.coverArtUrl) {
      notifyError('Please upload cover art before submitting');
      return;
    }
    
    if (tracks.length === 0) {
      notifyError('Please add at least one track before submitting');
      return;
    }
    
    const tracksWithoutAudio = tracks.filter(t => !t.audioFileUrl);
    if (tracksWithoutAudio.length > 0) {
      notifyError('All tracks must have audio files before submitting');
      return;
    }
    
    try {
      await releaseService.submitRelease(id);
      navigate('/dashboard/releases');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit release';
      notifyError(message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        {/* Wizard Stepper - Step depends on state */}
        <WizardStepper currentStep={
          release.status === 'DRAFT' && tracks.length === 0 ? 2 :
          release.status === 'DRAFT' ? 2 :
          release.status === 'PROCESSING' ? 3 :
          release.status === 'PENDING_REVIEW' ? 3 :
          3
        } />
        <Button variant="ghost" onClick={() => navigate('/dashboard/releases')} className="mb-4">
          ← Back to Releases
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{release.title}</h1>
            <p className="text-neutral-400 mt-1">{release.genre}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              release.status === 'DRAFT' ? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' :
              release.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              release.status === 'PENDING_REVIEW' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              release.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {release.status}
            </span>
            
            {canEdit && (
              <Button variant="primary" onClick={handleSubmitRelease}>
                Submit for Review
              </Button>
            )}
          </div>
        </div>
      </div>

      {(error || actionError) && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error || actionError}
        </div>
      )}

      {/* Cover Art Section */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Cover Art</h2>
        <FileUpload
          label="Upload cover art"
          accept=".jpg,.jpeg,.png,.webp"
          maxSize={10}
          onUpload={(file) => uploadCoverArt(file)}
          currentUrl={release.coverArtUrl}
          type="image"
        />
      </div>

      {/* Tracks Section */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Tracks</h2>
          {canEdit && !showTrackForm && (
            <Button onClick={() => setShowTrackForm(true)}>Add Track</Button>
          )}
        </div>

        {showTrackForm && (
          <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-white mb-4">Add New Track</h3>
            <TrackForm
              onSubmit={handleCreateTrack}
              onCancel={() => setShowTrackForm(false)}
              trackCount={tracks.length}
            />
          </div>
        )}

        <TrackList
          tracks={tracks}
          onDelete={canEdit ? handleDeleteTrack : undefined}
          editable={canEdit}
        />

        {/* Audio Upload for Each Track */}
        {canEdit && tracks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-white">Upload Audio Files</h3>
            {tracks.map((track) => (
              <div key={track.id} className="bg-neutral-800/50 border border-white/10 rounded-lg p-4">
                <p className="font-medium text-white mb-3">{track.trackOrder}. {track.title}</p>
                <FileUpload
                  label="Audio file"
                  accept=".mp3,.wav,.flac,.m4a,.aac"
                  maxSize={100}
                  onUpload={(file) => handleUploadAudio(track.id, file)}
                  currentUrl={track.audioFileUrl}
                  type="audio"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review & Submit (Step 3) */}
      {release.status === 'DRAFT' && tracks.length > 0 && release.coverArtUrl && (
        <div className="mt-6">
          <ReviewSummary release={release} tracks={tracks} onSubmit={handleSubmitRelease} />
        </div>
      )}

      {/* Status Messages */}
      {release.status === 'PROCESSING' && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg">
          Your release is being processed. This usually takes 5-10 seconds.
        </div>
      )}
      
      {release.status === 'PENDING_REVIEW' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg">
          Your release is pending admin review.
        </div>
      )}
      
      {release.status === 'PUBLISHED' && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
          Your release has been published!
        </div>
      )}
      
      {release.status === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          Your release was rejected. Please contact support for more information.
        </div>
      )}
    </div>
  );
}
