import { Pool } from 'pg';
import { User, UserProps } from '@domain/entities/User.js';
import { IUserRepository, CreateUserData } from '@domain/repositories/IUserRepository.js';
import { getDatabasePool } from '@infrastructure/database/index.js';

export class UserRepository implements IUserRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async create(data: CreateUserData): Promise<User> {
    const result = await this.pool.query<UserProps>(
      `INSERT INTO users (email, password_hash, artist_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, password_hash as "passwordHash", artist_name as "artistName", role, created_at as "createdAt", updated_at as "updatedAt"`,
      [data.email, data.passwordHash, data.artistName || null, data.role]
    );

    return new User(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserProps>(
      `SELECT id, email, password_hash as "passwordHash", artist_name as "artistName", role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserProps>(
      `SELECT id, email, password_hash as "passwordHash", artist_name as "artistName", role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists`,
      [email]
    );

    return result.rows[0].exists;
  }

  async update(user: User): Promise<User> {
    const result = await this.pool.query<UserProps>(
      `UPDATE users
       SET email = $1, password_hash = $2, artist_name = $3, role = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, password_hash as "passwordHash", artist_name as "artistName", role, created_at as "createdAt", updated_at as "updatedAt"`,
      [user.email, user.passwordHash, user.artistName || null, user.role, user.id]
    );

    return new User(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
