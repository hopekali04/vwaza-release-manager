import { Release, CreateReleaseData, UpdateReleaseData } from '../entities/Release.js';
import { ReleaseStatus } from '@vwaza/shared';
import type { PoolClient } from 'pg';

export interface IReleaseRepository {
  create(data: CreateReleaseData): Promise<Release>;
  findById(id: string): Promise<Release | null>;
  findByArtistId(artistId: string): Promise<Release[]>;
  findByStatus(status: ReleaseStatus): Promise<Release[]>;
  findAll(): Promise<Release[]>;
  update(id: string, data: UpdateReleaseData, client?: PoolClient): Promise<Release | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: ReleaseStatus): Promise<Release | null>;
  getReleasesWithTrackCount(artistId?: string): Promise<Array<Release & { trackCount: number }>>;
  getReleasesWithTrackCountPaginated(
    page: number,
    limit: number,
    artistId?: string,
    status?: ReleaseStatus
  ): Promise<{ releases: Array<Release & { trackCount: number }>; total: number }>;
}
