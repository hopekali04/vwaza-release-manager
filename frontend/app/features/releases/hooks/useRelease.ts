import { useState, useEffect } from 'react';
import { releaseService } from '../services/release.service';
import type { Release, Track } from '../types';

export function useRelease(releaseId: string | undefined) {
  const [release, setRelease] = useState<Release | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelease = async () => {
    if (!releaseId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [releaseData, tracksData] = await Promise.all([
        releaseService.getRelease(releaseId),
        releaseService.getTracks(releaseId),
      ]);
      setRelease(releaseData);
      setTracks(tracksData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch release');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelease();
  }, [releaseId]);

  const uploadCoverArt = async (file: File): Promise<boolean> => {
    if (!releaseId) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await releaseService.uploadCoverArt(releaseId, file);
      setRelease((prev) => prev ? { ...prev, coverArtUrl: url } : null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover art');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    release,
    tracks,
    isLoading,
    error,
    fetchRelease,
    uploadCoverArt,
    setTracks,
  };
}
