import { UserRole } from '@vwaza/shared';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  artistName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly artistName?: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    // Business rule: Email must not be empty
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('User email cannot be empty');
    }

    // Business rule: Password hash must not be empty
    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new Error('User password hash cannot be empty');
    }

    // Business rule: Artists must have an artist name
    if (props.role === UserRole.ARTIST && !props.artistName) {
      throw new Error('Artist users must have an artist name');
    }

    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.artistName = props.artistName;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is an artist
   */
  isArtist(): boolean {
    return this.role === UserRole.ARTIST;
  }

  /**
   * Get user data without password hash (for responses)
   */
  toPublicData(): Omit<UserProps, 'passwordHash'> {
    return {
      id: this.id,
      email: this.email,
      artistName: this.artistName,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
