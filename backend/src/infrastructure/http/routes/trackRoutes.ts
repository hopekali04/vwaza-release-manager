import { FastifyInstance } from 'fastify';
import { authenticate } from '@infrastructure/auth/middleware.js';
import { TrackController } from '../controllers/TrackController.js';

export async function trackRoutes(fastify: FastifyInstance) {
  const controller = new TrackController();

  fastify.post(
    '/releases/:releaseId/tracks',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        description: 'Add a track to a release',
        params: {
          type: 'object',
          properties: {
            releaseId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['title', 'trackOrder'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            trackOrder: { type: 'number', minimum: 1 },
            isrc: { type: 'string', minLength: 12, maxLength: 12 },
          },
        },
      },
    },
    controller.createTrack.bind(controller)
  );

  fastify.get(
    '/releases/:releaseId/tracks',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        description: 'List all tracks for a release',
        params: {
          type: 'object',
          properties: {
            releaseId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.listTracks.bind(controller)
  );

  fastify.patch(
    '/tracks/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        description: 'Update a track',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.updateTrack.bind(controller)
  );

  fastify.delete(
    '/tracks/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        description: 'Delete a track',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            description: 'Track deleted successfully',
            type: 'null',
          },
        },
      },
    },
    controller.deleteTrack.bind(controller)
  );

  fastify.post(
    '/tracks/:id/upload-audio',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        description: 'Upload audio file for a track',
        consumes: ['multipart/form-data'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.uploadAudioFile.bind(controller)
  );
}
