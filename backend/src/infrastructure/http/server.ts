import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { loadConfig } from '@config/index';
import { createLogger } from '@shared/logger';
import { createDatabasePool, testDatabaseConnection, closeDatabasePool } from '@infrastructure/database';
import { WorkerManager } from '@infrastructure/workers';
import { authRoutes } from './routes/authRoutes.js';
import { releaseRoutes } from './routes/releaseRoutes.js';
import { trackRoutes } from './routes/trackRoutes.js';

async function buildServer() {
  const config = loadConfig();
  const logger = createLogger(config);

  // Initialize database pool
  createDatabasePool();
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    throw new Error('Failed to connect to database');
  }
  
  logger.info('Database connection established');

  // Initialize background workers
  const workerManager = new WorkerManager();

  const server = Fastify({
    logger: logger as never,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await server.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Register multipart for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
      files: 1, // Max 1 file per request
    },
  });

  // Register Swagger for API documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Vwaza Release Manager API',
        description: 'API for managing music releases with artist and admin workflows',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Releases', description: 'Release management endpoints' },
        { name: 'Admin', description: 'Admin-only endpoints' },
        { name: 'Health', description: 'Health check endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token obtained from login',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // Register routes with prefixes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(releaseRoutes, { prefix: '/api' });
  await server.register(trackRoutes, { prefix: '/api' });

  server.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.elapsedTime;
    const shouldLog = reply.statusCode >= 400 || responseTime > 1000;

    if (shouldLog) {
      request.log.info({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: `${responseTime.toFixed(2)}ms`,
        requestId: request.id,
      });
    }
  });

  server.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          description: 'Server is healthy',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
          },
        },
      },
    },
  }, async () => {
    const dbHealthy = await testDatabaseConnection();
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  });

  server.addHook('onClose', async () => {
    logger.info('Server shutting down, cleaning up resources...');
    workerManager.stopAll();
    await closeDatabasePool();
    logger.info('Cleanup completed');
  });

  server.setErrorHandler((error, request, reply) => {
    request.log.error({
      method: request.method,
      url: request.url,
      statusCode: error.statusCode ?? 500,
      message: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
      requestId: request.id,
    });

    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'Internal Server Error';

    reply.status(statusCode).send({
      error: {
        message,
        statusCode,
        requestId: request.id,
      },
    });
  });

  return { server, config, workerManager };
}

async function start() {
  try {
    const { server, config, workerManager } = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    // Start background workers after server is listening
    await workerManager.startAll();

    console.log(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();
