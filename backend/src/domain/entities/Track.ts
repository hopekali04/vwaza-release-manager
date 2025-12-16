export interface Track {
  id: string;
  releaseId: string;
  title: string;
  isrc?: string;
  audioFileUrl: string;
  durationSeconds: number;
  trackOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrackData {
  releaseId: string;
  title: string;
  trackOrder: number;
  isrc?: string;
  audioFileUrl?: string;
  durationSeconds?: number;
}

export interface UpdateTrackData {
  title?: string;
  trackOrder?: number;
  isrc?: string;
  audioFileUrl?: string;
  durationSeconds?: number;
}
