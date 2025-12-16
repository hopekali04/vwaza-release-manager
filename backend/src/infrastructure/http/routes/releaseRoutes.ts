import { FastifyInstance } from 'fastify';
import { authenticate, authorize } from '@infrastructure/auth/middleware.js';
import { ReleaseController } from '../controllers/ReleaseController.js';
import { ReleaseRepository } from '@infrastructure/repositories/ReleaseRepository.js';
import { TrackRepository } from '@infrastructure/repositories/TrackRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { UserRole } from '@vwaza/shared';

export async function releaseRoutes(fastify: FastifyInstance) {
  const releaseRepository = new ReleaseRepository();
  const trackRepository = new TrackRepository();
  const cloudStorage = new CloudStorageService();
  const controller = new ReleaseController(releaseRepository, trackRepository, cloudStorage);

  // Artist routes - create, read, update, delete their own releases
  fastify.post(
    '/releases',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Create a new release (Draft status)',
        body: {
          type: 'object',
          required: ['title', 'genre'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            genre: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
        response: {
          201: {
            description: 'Release created successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              artistId: { type: 'string' },
              title: { type: 'string' },
              genre: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    controller.createRelease.bind(controller)
  );

  fastify.get(
    '/releases',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'List all releases (artists see their own, admins see all) with pagination',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', nullable: true },
          },
        },
        response: {
          200: {
            description: 'Paginated list of releases with track counts',
            type: 'object',
            properties: {
              releases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    artistId: { type: 'string' },
                    title: { type: 'string' },
                    genre: { type: 'string' },
                    coverArtUrl: { type: 'string', nullable: true },
                    status: { type: 'string' },
                    trackCount: { type: 'number' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    controller.listReleases.bind(controller)
  );

  fastify.get(
    '/releases/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Get a specific release',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.getRelease.bind(controller)
  );

  fastify.patch(
    '/releases/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Update a release (only in DRAFT status)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.updateRelease.bind(controller)
  );

  fastify.delete(
    '/releases/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Delete a release',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            description: 'Release deleted successfully',
            type: 'null',
          },
        },
      },
    },
    controller.deleteRelease.bind(controller)
  );

  fastify.post(
    '/releases/:id/submit',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Submit release for review (moves to PROCESSING status)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.submitRelease.bind(controller)
  );

  fastify.post(
    '/releases/:id/upload-cover',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'Upload cover art for a release',
        consumes: ['multipart/form-data'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.uploadCoverArt.bind(controller)
  );

  // Admin-only routes
  fastify.post(
    '/admin/releases/:id/approve',
    {
      preHandler: [authenticate, authorize(UserRole.ADMIN)],
      schema: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        description: 'Approve a release (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.approveRelease.bind(controller)
  );

  fastify.post(
    '/admin/releases/:id/reject',
    {
      preHandler: [authenticate, authorize(UserRole.ADMIN)],
      schema: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        description: 'Reject a release (Admin only)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.rejectRelease.bind(controller)
  );

  // SSE endpoint - Subscribe to release updates (token via query param)
  fastify.get(
    '/releases/subscribe',
    {
      schema: {
        tags: ['Releases'],
        description: 'Subscribe to real-time release updates via Server-Sent Events',
        querystring: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', description: 'JWT token for authentication' },
          },
        },
      },
    },
    controller.subscribeToUpdates.bind(controller)
  );
}
