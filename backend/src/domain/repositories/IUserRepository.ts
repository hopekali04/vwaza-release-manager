import { User } from '../entities/User.js';
import { UserRole } from '@vwaza/shared';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  artistName?: string;
  role: UserRole;
}

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if email already exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Update user
   */
  update(user: User): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;
}
