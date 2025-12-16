import { Track, CreateTrackData, UpdateTrackData } from '../entities/Track.js';
import type { PoolClient } from 'pg';

export interface ITrackRepository {
  create(data: CreateTrackData): Promise<Track>;
  findById(id: string): Promise<Track | null>;
  findByReleaseId(releaseId: string): Promise<Track[]>;
  update(id: string, data: UpdateTrackData, client?: PoolClient): Promise<Track | null>;
  delete(id: string): Promise<boolean>;
  countByReleaseId(releaseId: string): Promise<number>;
}
