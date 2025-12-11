import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { loadConfig } from '@config/index.js';
import { createLogger } from '@shared/logger.js';

async function buildServer() {
  const config = loadConfig();
  const logger = createLogger(config);

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

  server.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.getResponseTime();
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

  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
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

  return { server, config };
}

async function start() {
  try {
    const { server, config } = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();
