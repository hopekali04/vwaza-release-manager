import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUpUseCase } from '@application/use-cases/SignUpUseCase.js';
import { SignInUseCase } from '@application/use-cases/SignInUseCase.js';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { User } from '@domain/entities/User.js';
import { UserRole } from '@vwaza/shared';
import * as passwordModule from '@infrastructure/auth/password.js';
import * as jwtModule from '@infrastructure/auth/jwt.js';

// Mock dependencies
vi.mock('@infrastructure/auth/password.js');
vi.mock('@infrastructure/auth/jwt.js');

describe('SignUpUseCase', () => {
  let signUpUseCase: SignUpUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock repository
    mockUserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      emailExists: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    signUpUseCase = new SignUpUseCase(mockUserRepository);
  });

  it('should create a new artist user successfully', async () => {
    // Arrange
    const signUpRequest = {
      email: 'artist@example.com',
      password: 'SecureP@ss123',
      artistName: 'Test Artist',
      role: UserRole.ARTIST,
    };

    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: signUpRequest.email,
      passwordHash: 'hashed_password',
      artistName: signUpRequest.artistName,
      role: UserRole.ARTIST,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepository.emailExists).mockResolvedValue(false);
    vi.mocked(passwordModule.hashPassword).mockResolvedValue('hashed_password');
    vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
    vi.mocked(jwtModule.generateAccessToken).mockReturnValue('mock_token');

    // Act
    const result = await signUpUseCase.execute(signUpRequest);

    // Assert
    expect(mockUserRepository.emailExists).toHaveBeenCalledWith(signUpRequest.email);
    expect(passwordModule.hashPassword).toHaveBeenCalledWith(signUpRequest.password);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: signUpRequest.email,
      passwordHash: 'hashed_password',
      artistName: signUpRequest.artistName,
      role: UserRole.ARTIST,
    });
    expect(jwtModule.generateAccessToken).toHaveBeenCalledWith({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });
    expect(result).toEqual({
      accessToken: 'mock_token',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        artistName: mockUser.artistName,
      },
    });
  });

  it('should create a new admin user without artist name', async () => {
    // Arrange
    const signUpRequest = {
      email: 'admin@example.com',
      password: 'SecureP@ss123',
      role: UserRole.ADMIN,
    };

    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: signUpRequest.email,
      passwordHash: 'hashed_password',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepository.emailExists).mockResolvedValue(false);
    vi.mocked(passwordModule.hashPassword).mockResolvedValue('hashed_password');
    vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
    vi.mocked(jwtModule.generateAccessToken).mockReturnValue('mock_token');

    // Act
    const result = await signUpUseCase.execute(signUpRequest);

    // Assert
    expect(result.user.artistName).toBeUndefined();
    expect(result.user.role).toBe(UserRole.ADMIN);
  });

  it('should throw error if email already exists', async () => {
    // Arrange
    const signUpRequest = {
      email: 'existing@example.com',
      password: 'SecureP@ss123',
      artistName: 'Test Artist',
      role: UserRole.ARTIST,
    };

    vi.mocked(mockUserRepository.emailExists).mockResolvedValue(true);

    // Act & Assert
    await expect(signUpUseCase.execute(signUpRequest)).rejects.toThrow('Email already registered');
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should default to ARTIST role if not specified', async () => {
    // Arrange
    const signUpRequest = {
      email: 'default@example.com',
      password: 'SecureP@ss123',
      artistName: 'Default Artist',
    };

    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174002',
      email: signUpRequest.email,
      passwordHash: 'hashed_password',
      artistName: signUpRequest.artistName,
      role: UserRole.ARTIST,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepository.emailExists).mockResolvedValue(false);
    vi.mocked(passwordModule.hashPassword).mockResolvedValue('hashed_password');
    vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
    vi.mocked(jwtModule.generateAccessToken).mockReturnValue('mock_token');

    // Act
    await signUpUseCase.execute(signUpRequest);

    // Assert
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.ARTIST })
    );
  });
});

describe('SignInUseCase', () => {
  let signInUseCase: SignInUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockUserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      emailExists: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    signInUseCase = new SignInUseCase(mockUserRepository);
  });

  it('should sign in successfully with valid credentials', async () => {
    // Arrange
    const signInRequest = {
      email: 'artist@example.com',
      password: 'SecureP@ss123',
    };

    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: signInRequest.email,
      passwordHash: 'hashed_password',
      artistName: 'Test Artist',
      role: UserRole.ARTIST,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordModule.comparePassword).mockResolvedValue(true);
    vi.mocked(jwtModule.generateAccessToken).mockReturnValue('mock_token');

    // Act
    const result = await signInUseCase.execute(signInRequest);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(signInRequest.email);
    expect(passwordModule.comparePassword).toHaveBeenCalledWith(
      signInRequest.password,
      mockUser.passwordHash
    );
    expect(jwtModule.generateAccessToken).toHaveBeenCalledWith({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });
    expect(result).toEqual({
      accessToken: 'mock_token',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        artistName: mockUser.artistName,
      },
    });
  });

  it('should throw error if user not found', async () => {
    // Arrange
    const signInRequest = {
      email: 'nonexistent@example.com',
      password: 'SecureP@ss123',
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    // Act & Assert
    await expect(signInUseCase.execute(signInRequest)).rejects.toThrow('Invalid credentials');
    expect(passwordModule.comparePassword).not.toHaveBeenCalled();
  });

  it('should throw error if password is invalid', async () => {
    // Arrange
    const signInRequest = {
      email: 'artist@example.com',
      password: 'WrongPassword123!',
    };

    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: signInRequest.email,
      passwordHash: 'hashed_password',
      artistName: 'Test Artist',
      role: UserRole.ARTIST,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordModule.comparePassword).mockResolvedValue(false);

    // Act & Assert
    await expect(signInUseCase.execute(signInRequest)).rejects.toThrow('Invalid credentials');
    expect(jwtModule.generateAccessToken).not.toHaveBeenCalled();
  });
});
