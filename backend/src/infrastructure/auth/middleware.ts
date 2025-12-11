import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@vwaza/shared';
import { extractTokenFromHeader, verifyAccessToken, JwtPayload } from './jwt.js';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JwtPayload;
}

export async function authenticate(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractTokenFromHeader(request.headers.authorization);
    
    if (!token) {
      reply.status(401).send({
        error: {
          message: 'Missing authorization token',
          statusCode: 401,
          requestId: request.id,
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    request.user = payload;
    
    request.log.info({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }, 'User authenticated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    reply.status(401).send({
      error: {
        message,
        statusCode: 401,
        requestId: request.id,
      },
    });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({
        error: {
          message: 'Authentication required',
          statusCode: 401,
          requestId: request.id,
        },
      });
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      reply.status(403).send({
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
          requestId: request.id,
        },
      });
    }
  };
}
