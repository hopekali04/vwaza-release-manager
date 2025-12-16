import { ReleaseStatus } from '@vwaza/shared';

export interface Release {
  id: string;
  artistId: string;
  title: string;
  genre: string;
  coverArtUrl?: string;
  status: ReleaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReleaseData {
  artistId: string;
  title: string;
  genre: string;
}

export interface UpdateReleaseData {
  title?: string;
  genre?: string;
  coverArtUrl?: string;
  status?: ReleaseStatus;
}
