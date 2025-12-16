export enum ReleaseStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export interface Release {
  id: string;
  artistId: string;
  title: string;
  genre: string;
  coverArtUrl?: string;
  status: ReleaseStatus;
  trackCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  releaseId: string;
  title: string;
  isrc?: string;
  audioFileUrl: string;
  durationSeconds: number;
  trackOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseData {
  title: string;
  genre: string;
}

export interface UpdateReleaseData {
  title?: string;
  genre?: string;
}

export interface CreateTrackData {
  title: string;
  trackOrder: number;
  isrc?: string;
}
