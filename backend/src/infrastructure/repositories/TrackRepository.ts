import { Pool } from 'pg';
import { getDatabasePool } from '@infrastructure/database/index.js';
import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { Track, CreateTrackData, UpdateTrackData } from '@domain/entities/Track.js';

export class TrackRepository implements ITrackRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async create(data: CreateTrackData): Promise<Track> {
    const result = await this.pool.query(
      `INSERT INTO tracks (release_id, title, track_order, isrc, audio_file_url, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.releaseId,
        data.title,
        data.trackOrder,
        data.isrc || null,
        data.audioFileUrl || '',
        // DB constraint requires duration_seconds > 0; default to 1s until audio upload updates it
        data.durationSeconds && data.durationSeconds > 0 ? data.durationSeconds : 1,
      ]
    );
    return this.mapToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Track | null> {
    const result = await this.pool.query('SELECT * FROM tracks WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findByReleaseId(releaseId: string): Promise<Track[]> {
    const result = await this.pool.query(
      'SELECT * FROM tracks WHERE release_id = $1 ORDER BY track_order ASC',
      [releaseId]
    );
    return result.rows.map(this.mapToEntity);
  }

  async update(
    id: string,
    data: UpdateTrackData,
    client?: import('pg').PoolClient
  ): Promise<Track | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.trackOrder !== undefined) {
      updates.push(`track_order = $${paramIndex++}`);
      values.push(data.trackOrder);
    }
    if (data.isrc !== undefined) {
      updates.push(`isrc = $${paramIndex++}`);
      values.push(data.isrc);
    }
    if (data.audioFileUrl !== undefined) {
      updates.push(`audio_file_url = $${paramIndex++}`);
      values.push(data.audioFileUrl);
    }
    if (data.durationSeconds !== undefined) {
      updates.push(`duration_seconds = $${paramIndex++}`);
      values.push(data.durationSeconds);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const queryRunner = client || this.pool;
    const result = await queryRunner.query(
      `UPDATE tracks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tracks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async countByReleaseId(releaseId: string): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*)::int as count FROM tracks WHERE release_id = $1',
      [releaseId]
    );
    return result.rows[0].count;
  }

  private mapToEntity(row: any): Track {
    return {
      id: row.id,
      releaseId: row.release_id,
      title: row.title,
      isrc: row.isrc,
      audioFileUrl: row.audio_file_url,
      durationSeconds: row.duration_seconds,
      trackOrder: row.track_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
