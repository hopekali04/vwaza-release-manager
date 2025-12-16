import { useState, useEffect, useRef } from 'react';
import { releaseService } from '../services/release.service';
import { sseService } from '../services/sse.service';
import { authService } from '../../auth/services/auth.service';
import type { Release, CreateReleaseData, UpdateReleaseData } from '../types';

export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sseFailedRef = useRef(false);

  const fetchReleases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await releaseService.getReleases();
      setReleases(response.releases);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch releases';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    // Poll for updates every 10 seconds (slower than original, to reduce server load)
    pollIntervalRef.current = setInterval(fetchReleases, 10000);
  };

  useEffect(() => {
    fetchReleases();

    // Subscribe to real-time updates via SSE
    const token = authService.getToken();
    if (token) {
      unsubscribeRef.current = sseService.subscribe(token, (message) => {
        if (message.type === 'initial') {
          // Initial data from server
          if (message.releases) {
            setReleases(message.releases);
          }
        } else if (message.type === 'update') {
          // Update existing release
          if (message.release) {
            setReleases((prev) =>
              prev.map((r) => (r.id === message.release!.id ? message.release! : r))
            );
          }
        } else if (message.type === 'delete') {
          // Remove deleted release
          if (message.releaseId) {
            setReleases((prev) => prev.filter((r) => r.id !== message.releaseId));
          }
        } else if (message.type === 'error') {
          // SSE failed, fallback to polling
          sseFailedRef.current = true;
          setError('Real-time updates unavailable. Using polling instead.');
          startPolling();
        }
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const createRelease = async (data: CreateReleaseData): Promise<Release | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newRelease = await releaseService.createRelease(data);
      setReleases((prev) => [newRelease, ...prev]);
      return newRelease;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create release';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRelease = async (id: string, data: UpdateReleaseData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await releaseService.updateRelease(id, data);
      setReleases((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return true;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to update release';
      setError(message)
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRelease = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await releaseService.deleteRelease(id);
      setReleases((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete release';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitRelease = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await releaseService.submitRelease(id);
      setReleases((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to submit release');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    releases,
    isLoading,
    error,
    fetchReleases,
    createRelease,
    updateRelease,
    deleteRelease,
    submitRelease,
  };
}
