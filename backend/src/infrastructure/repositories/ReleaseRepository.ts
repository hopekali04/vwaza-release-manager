import { Pool } from 'pg';
import { getDatabasePool } from '@infrastructure/database';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { Release, CreateReleaseData, UpdateReleaseData } from '@domain/entities/Release.js';
import { ReleaseStatus } from '@vwaza/shared';

export class ReleaseRepository implements IReleaseRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async create(data: CreateReleaseData): Promise<Release> {
    const result = await this.pool.query(
      `INSERT INTO releases (artist_id, title, genre, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.artistId, data.title, data.genre, ReleaseStatus.DRAFT]
    );
    return this.mapToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Release | null> {
    const result = await this.pool.query(
      'SELECT * FROM releases WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findByArtistId(artistId: string): Promise<Release[]> {
    const result = await this.pool.query(
      'SELECT * FROM releases WHERE artist_id = $1 ORDER BY created_at DESC',
      [artistId]
    );
    return result.rows.map(this.mapToEntity);
  }

  async findByStatus(status: ReleaseStatus): Promise<Release[]> {
    const result = await this.pool.query(
      'SELECT * FROM releases WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows.map(this.mapToEntity);
  }

  async findAll(): Promise<Release[]> {
    const result = await this.pool.query(
      'SELECT * FROM releases ORDER BY created_at DESC'
    );
    return result.rows.map(this.mapToEntity);
  }

  async update(id: string, data: UpdateReleaseData, client?: import('pg').PoolClient): Promise<Release | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.genre !== undefined) {
      updates.push(`genre = $${paramIndex++}`);
      values.push(data.genre);
    }
    if (data.coverArtUrl !== undefined) {
      updates.push(`cover_art_url = $${paramIndex++}`);
      values.push(data.coverArtUrl);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const queryRunner = client || this.pool;
    const result = await queryRunner.query(
      `UPDATE releases SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM releases WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async updateStatus(id: string, status: ReleaseStatus): Promise<Release | null> {
    const result = await this.pool.query(
      'UPDATE releases SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async getReleasesWithTrackCount(artistId?: string): Promise<Array<Release & { trackCount: number }>> {
    const query = artistId
      ? `SELECT r.*, COUNT(t.id)::int as track_count
         FROM releases r
         LEFT JOIN tracks t ON t.release_id = r.id
         WHERE r.artist_id = $1
         GROUP BY r.id
         ORDER BY r.created_at DESC`
      : `SELECT r.*, COUNT(t.id)::int as track_count
         FROM releases r
         LEFT JOIN tracks t ON t.release_id = r.id
         GROUP BY r.id
         ORDER BY r.created_at DESC`;

    const result = artistId
      ? await this.pool.query(query, [artistId])
      : await this.pool.query(query);

    return result.rows.map((row) => ({
      ...this.mapToEntity(row),
      trackCount: row.track_count,
    }));
  }

  async getReleasesWithTrackCountPaginated(
    page: number,
    limit: number,
    artistId?: string,
    status?: ReleaseStatus
  ): Promise<{ releases: Array<Release & { trackCount: number }>; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (artistId) {
      whereConditions.push(`r.artist_id = $${paramIndex++}`);
      params.push(artistId);
    }

    if (status) {
      whereConditions.push(`r.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT r.id)::int as total
      FROM releases r
      ${whereClause}
    `;
    const countResult = await this.pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    // Get paginated results
    const dataQuery = `
      SELECT r.*, COUNT(t.id)::int as track_count
      FROM releases r
      LEFT JOIN tracks t ON t.release_id = r.id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);

    const releases = dataResult.rows.map((row) => ({
      ...this.mapToEntity(row),
      trackCount: row.track_count,
    }));

    return { releases, total };
  }

  private mapToEntity(row: any): Release {
    return {
      id: row.id,
      artistId: row.artist_id,
      title: row.title,
      genre: row.genre,
      coverArtUrl: row.cover_art_url,
      status: row.status as ReleaseStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
