import { useState, useEffect } from 'react';
import { releaseService } from '../services/release.service';
import type { Release, CreateReleaseData, UpdateReleaseData } from '../types';

export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await releaseService.getReleases();
      setReleases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch releases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchReleases, 5000);
    return () => clearInterval(interval);
  }, []);

  const createRelease = async (data: CreateReleaseData): Promise<Release | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newRelease = await releaseService.createRelease(data);
      setReleases((prev) => [newRelease, ...prev]);
      return newRelease;
    } catch (err: any) {
      setError(err.message || 'Failed to create release');
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
      setError(err.message || 'Failed to update release');
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
    } catch (err: any) {
      setError(err.message || 'Failed to delete release');
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
