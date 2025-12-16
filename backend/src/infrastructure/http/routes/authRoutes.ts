import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';

/**
 * Register authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authController = new AuthController();

  // POST /signup
  fastify.post(
    '/signup',
    {
      config: {
        rateLimit: {
          max: 5, // 5 signup attempts
          timeWindow: '15 minutes', // per 15 minutes
        },
      },
      schema: {
        description: 'Create a new user account',
        tags: ['Authentication'],
        body: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description:
                'Password (min 8 chars, must contain uppercase, lowercase, number, special character)',
            },
            artistName: {
              type: 'string',
              description: 'Artist name (required for ARTIST role)',
            },
            role: {
              type: 'string',
              description: 'User role (ARTIST or ADMIN)',
            },
          },
        },
        response: {
          201: {
            description: 'User created successfully',
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                description: 'JWT access token',
              },
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'User ID',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email',
                  },
                  role: {
                    type: 'string',
                    enum: ['ARTIST', 'ADMIN'],
                    description: 'User role',
                  },
                  artistName: {
                    type: 'string',
                    description: 'Artist name (only for ARTIST role)',
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  details: { type: 'object' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
          409: {
            description: 'Email already registered',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    authController.signUp.bind(authController)
  );

  // POST /signin
  fastify.post(
    '/signin',
    {
      config: {
        rateLimit: {
          max: 10, // 10 login attempts
          timeWindow: '15 minutes', // per 15 minutes
        },
      },
      schema: {
        description: 'Authenticate user and return access token',
        tags: ['Authentication'],
        body: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
        },
        response: {
          200: {
            description: 'Authentication successful',
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                description: 'JWT access token',
              },
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'User ID',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email',
                  },
                  role: {
                    type: 'string',
                    enum: ['ARTIST', 'ADMIN'],
                    description: 'User role',
                  },
                  artistName: {
                    type: 'string',
                    description: 'Artist name (only for ARTIST role)',
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  details: { type: 'object' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  statusCode: { type: 'number' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    authController.signIn.bind(authController)
  );
}
