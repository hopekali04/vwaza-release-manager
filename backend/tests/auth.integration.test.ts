import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { config } from 'dotenv';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { authRoutes } from '@infrastructure/http/routes/authRoutes.js';
import { UserRole } from '@vwaza/shared';
import { createDatabasePool, closeDatabasePool, getDatabasePool } from '@infrastructure/database/index.js';

// Load environment variables from .env file
config();

describe('Auth Routes Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    // Set up required environment variables for testing (fallback to defaults if not in .env)
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test-secret';
    process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'test-bucket';
    
    // Initialize database pool
    createDatabasePool();

    // Create Fastify server with auth routes
    server = Fastify();
    await server.register(authRoutes, { prefix: '/api/auth' });
  });

  afterAll(async () => {
    await server.close();
    await closeDatabasePool();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    const pool = getDatabasePool();
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new artist account successfully', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'artist@test.com',
          password: 'SecureP@ss123',
          artistName: 'Test Artist',
          role: UserRole.ARTIST,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('accessToken');
      expect(body.user).toMatchObject({
        email: 'artist@test.com',
        role: UserRole.ARTIST,
        artistName: 'Test Artist',
      });
      expect(body.user).toHaveProperty('id');
      expect(typeof body.accessToken).toBe('string');
    });

    it('should create a new admin account successfully', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'admin@test.com',
          password: 'AdminP@ss123',
          role: UserRole.ADMIN,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('accessToken');
      expect(body.user).toMatchObject({
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });
      expect(body.user.artistName).toBeFalsy();
    });

    it('should default to ARTIST role if not specified', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'default@test.com',
          password: 'SecureP@ss123',
          artistName: 'Default Artist',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.role).toBe(UserRole.ARTIST);
    });

    it('should reject duplicate email', async () => {
      // First signup
      await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'duplicate@test.com',
          password: 'SecureP@ss123',
          artistName: 'First User',
          role: UserRole.ARTIST,
        },
      });

      // Second signup with same email
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'duplicate@test.com',
          password: 'DifferentP@ss456',
          artistName: 'Second User',
          role: UserRole.ARTIST,
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Email already registered');
    });

    it('should reject invalid email format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'invalid-email',
          password: 'SecureP@ss123',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Validation failed');
    });

    it('should reject weak password (no uppercase)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'weak@test.com',
          password: 'securep@ss123',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Validation failed');
    });

    it('should reject weak password (no lowercase)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'weak2@test.com',
          password: 'SECUREP@SS123',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject weak password (no number)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'weak3@test.com',
          password: 'SecureP@ssword',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject weak password (no special character)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'weak4@test.com',
          password: 'SecurePass123',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject weak password (too short)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'weak5@test.com',
          password: 'Sec@12',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject missing email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          password: 'SecureP@ss123',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject missing password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@test.com',
          artistName: 'Test Artist',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a test user before each signin test
      await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'signin@test.com',
          password: 'SecureP@ss123',
          artistName: 'Signin Test Artist',
          role: UserRole.ARTIST,
        },
      });
    });

    it('should sign in successfully with valid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'signin@test.com',
          password: 'SecureP@ss123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('accessToken');
      expect(body.user).toMatchObject({
        email: 'signin@test.com',
        role: UserRole.ARTIST,
        artistName: 'Signin Test Artist',
      });
      expect(typeof body.accessToken).toBe('string');
    });

    it('should reject invalid email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'nonexistent@test.com',
          password: 'SecureP@ss123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'signin@test.com',
          password: 'WrongP@ss123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Invalid credentials');
    });

    it('should reject missing email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          password: 'SecureP@ss123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('Validation failed');
    });

    it('should reject missing password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'signin@test.com',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject empty password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'signin@test.com',
          password: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
