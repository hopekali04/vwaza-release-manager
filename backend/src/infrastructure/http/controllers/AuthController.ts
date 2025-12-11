import { FastifyRequest, FastifyReply } from 'fastify';
import {
  signUpRequestSchema,
  signInRequestSchema,
  type SignUpRequestDto,
  type SignInRequestDto,
} from '@vwaza/shared';
import { SignUpUseCase } from '@application/use-cases/SignUpUseCase.js';
import { SignInUseCase } from '@application/use-cases/SignInUseCase.js';
import { UserRepository } from '@infrastructure/repositories/UserRepository.js';

export class AuthController {
  private signUpUseCase: SignUpUseCase;
  private signInUseCase: SignInUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.signUpUseCase = new SignUpUseCase(userRepository);
    this.signInUseCase = new SignInUseCase(userRepository);
  }

  /**
   * POST /api/auth/signup
   * Create a new user account
   */
  async signUp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Validate request body
      const validation = signUpRequestSchema.safeParse(request.body);
      if (!validation.success) {
        reply.status(400).send({
          error: {
            message: 'Validation failed',
            details: validation.error.flatten(),
            statusCode: 400,
            requestId: request.id,
          },
        });
        return;
      }

      const signUpData: SignUpRequestDto = validation.data;

      // Execute use case
      request.log.info({ email: signUpData.email, role: signUpData.role }, 'User signup attempt');
      const result = await this.signUpUseCase.execute(signUpData);

      request.log.info(
        { userId: result.user.id, email: result.user.email, role: result.user.role },
        'User signed up successfully'
      );

      reply.status(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      request.log.error({ error, requestId: request.id }, 'Sign up error');

      // Handle specific errors
      if (message === 'Email already registered') {
        reply.status(409).send({
          error: {
            message,
            statusCode: 409,
            requestId: request.id,
          },
        });
        return;
      }

      reply.status(500).send({
        error: {
          message: 'Internal server error',
          statusCode: 500,
          requestId: request.id,
        },
      });
    }
  }

  /**
   * POST /api/auth/signin
   * Authenticate user and return access token
   */
  async signIn(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Validate request body
      const validation = signInRequestSchema.safeParse(request.body);
      if (!validation.success) {
        reply.status(400).send({
          error: {
            message: 'Validation failed',
            details: validation.error.flatten(),
            statusCode: 400,
            requestId: request.id,
          },
        });
        return;
      }

      const signInData: SignInRequestDto = validation.data;

      // Execute use case
      request.log.info({ email: signInData.email }, 'User signin attempt');
      const result = await this.signInUseCase.execute(signInData);

      request.log.info(
        { userId: result.user.id, email: result.user.email, role: result.user.role },
        'User signed in successfully'
      );

      reply.status(200).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      request.log.error({ error, requestId: request.id }, 'Sign in error');

      // Handle invalid credentials
      if (message === 'Invalid credentials') {
        reply.status(401).send({
          error: {
            message,
            statusCode: 401,
            requestId: request.id,
          },
        });
        return;
      }

      reply.status(500).send({
        error: {
          message: 'Internal server error',
          statusCode: 500,
          requestId: request.id,
        },
      });
    }
  }
}
