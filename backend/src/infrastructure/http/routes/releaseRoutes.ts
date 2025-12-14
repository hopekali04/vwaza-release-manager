import { FastifyInstance } from 'fastify';
import { authenticate, authorize } from '@infrastructure/auth/middleware.js';
import { ReleaseController } from '../controllers/ReleaseController.js';
import { UserRole } from '@vwaza/shared';

export async function releaseRoutes(fastify: FastifyInstance) {
  const controller = new ReleaseController();

  // Artist routes - create, read, update, delete their own releases
  fastify.post(
    '/api/releases',
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
    '/api/releases',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Releases'],
        security: [{ bearerAuth: [] }],
        description: 'List all releases (artists see their own, admins see all)',
        response: {
          200: {
            description: 'List of releases with track counts',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                artistId: { type: 'string' },
                title: { type: 'string' },
                genre: { type: 'string' },
                coverArtUrl: { type: 'string' },
                status: { type: 'string' },
                trackCount: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    controller.listReleases.bind(controller)
  );

  fastify.get(
    '/api/releases/:id',
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
    '/api/releases/:id',
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
    '/api/releases/:id',
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
    '/api/releases/:id/submit',
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
    '/api/releases/:id/upload-cover',
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
    '/api/admin/releases/:id/approve',
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
    '/api/admin/releases/:id/reject',
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
}
