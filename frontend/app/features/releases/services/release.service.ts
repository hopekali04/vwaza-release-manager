import { apiClient } from '~/lib/api';
import type { Release, CreateReleaseData, UpdateReleaseData, Track, CreateTrackData } from '../types';
import type { PaginatedReleasesResponse, GetReleasesParams } from '@vwaza/shared';

export type { PaginatedReleasesResponse, GetReleasesParams };

export const releaseService = {
  async createRelease(data: CreateReleaseData): Promise<Release> {
    return apiClient.post('/api/releases', data);
  },

  async getReleases(params?: GetReleasesParams): Promise<PaginatedReleasesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return apiClient.get(`/api/releases${query ? `?${query}` : ''}`);
  },

  async getRelease(id: string): Promise<Release> {
    return apiClient.get(`/api/releases/${id}`);
  },

  async updateRelease(id: string, data: UpdateReleaseData): Promise<Release> {
    return apiClient.patch(`/api/releases/${id}`, data);
  },

  async deleteRelease(id: string): Promise<void> {
    return apiClient.delete(`/api/releases/${id}`);
  },

  async submitRelease(id: string): Promise<Release> {
    return apiClient.post(`/api/releases/${id}/submit`, {});
  },

  async uploadCoverArt(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/api/releases/${id}/upload-cover`, formData);
  },

  async getTracks(releaseId: string): Promise<Track[]> {
    return apiClient.get(`/api/releases/${releaseId}/tracks`);
  },

  async createTrack(releaseId: string, data: CreateTrackData): Promise<Track> {
    // Backend treats ISRC as optional but validates length when present; drop empty strings to avoid 400
    const payload = { ...data } as Partial<CreateTrackData>;
    if (!payload.isrc || payload.isrc.trim().length === 0) {
      delete payload.isrc;
    }
    return apiClient.post(`/api/releases/${releaseId}/tracks`, payload);
  },

  async updateTrack(id: string, data: Partial<CreateTrackData>): Promise<Track> {
    return apiClient.patch(`/api/tracks/${id}`, data);
  },

  async deleteTrack(id: string): Promise<void> {
    return apiClient.delete(`/api/tracks/${id}`);
  },

  async uploadAudioFile(trackId: string, file: File): Promise<{ url: string; duration: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/api/tracks/${trackId}/upload-audio`, formData);
  },

  async approveRelease(id: string): Promise<Release> {
    return apiClient.post(`/api/admin/releases/${id}/approve`, {});
  },

  async rejectRelease(id: string): Promise<Release> {
    return apiClient.post(`/api/admin/releases/${id}/reject`, {});
  },
};
