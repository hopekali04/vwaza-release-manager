import { FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticatedRequest } from '@infrastructure/auth/middleware.js';
import { ReleaseRepository } from '@infrastructure/repositories/ReleaseRepository.js';
import { TrackRepository } from '@infrastructure/repositories/TrackRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { CreateReleaseUseCase } from '@application/use-cases/CreateReleaseUseCase.js';
import { ListReleasesUseCase } from '@application/use-cases/ListReleasesUseCase.js';
import { UpdateReleaseUseCase } from '@application/use-cases/UpdateReleaseUseCase.js';
import { DeleteReleaseUseCase } from '@application/use-cases/DeleteReleaseUseCase.js';
import { SubmitReleaseUseCase } from '@application/use-cases/SubmitReleaseUseCase.js';
import { ApproveReleaseUseCase } from '@application/use-cases/ApproveReleaseUseCase.js';
import { RejectReleaseUseCase } from '@application/use-cases/RejectReleaseUseCase.js';
import { UploadCoverArtUseCase } from '@application/use-cases/UploadCoverArtUseCase.js';
import {
  createReleaseRequestSchema,
  updateReleaseRequestSchema,
  UserRole,
  ReleaseStatus,
} from '@vwaza/shared';
import { ResourceNotFoundError, InvalidStateError } from '@application/errors/ApplicationErrors.js';

const listReleasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(ReleaseStatus).optional(),
});

export class ReleaseController {
  constructor(
    private readonly releaseRepository: ReleaseRepository,
    private readonly trackRepository: TrackRepository,
    private readonly cloudStorage: CloudStorageService
  ) {}

  async createRelease(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const result = createReleaseRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      reply.status(400).send({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const useCase = new CreateReleaseUseCase(this.releaseRepository);
    const release = await useCase.execute(request.user!.userId, result.data);

    reply.status(201).send(release);
  }

  async getRelease(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const release = await this.verifyReleaseAccess(request, reply, id);
    if (!release) return;

    reply.send(release);
  }

  async listReleases(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const parseResult = listReleasesQuerySchema.safeParse(request.query);

    if (!parseResult.success) {
      reply.status(400).send({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const useCase = new ListReleasesUseCase(this.releaseRepository);
    const { page, limit, status } = parseResult.data;

    // Artists see only their releases, admins see all
    const artistId = request.user!.role === UserRole.ARTIST ? request.user!.userId : undefined;

    const result = await useCase.execute({
      artistId,
      status,
      page,
      limit,
    });

    reply.send(result);
  }

  async updateRelease(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    const result = updateReleaseRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      reply.status(400).send({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    // Verify ownership
    const { id } = request.params as { id: string };
    const release = await this.verifyReleaseAccess(request, reply, id);
    if (!release) return;

    const useCase = new UpdateReleaseUseCase(this.releaseRepository);
    const updatedRelease = await useCase.execute(id, result.data);

    if (!updatedRelease) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    reply.send(updatedRelease);
  }

  async deleteRelease(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Verify ownership
    const { id } = request.params as { id: string };
    const release = await this.verifyReleaseAccess(request, reply, id);
    if (!release) return;

    const useCase = new DeleteReleaseUseCase(this.releaseRepository);
    const deleted = await useCase.execute(id);

    if (!deleted) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    reply.status(204).send();
  }

  async submitRelease(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Verify ownership
    const { id } = request.params as { id: string };
    const release = await this.releaseRepository.findById(id);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    try {
      const useCase = new SubmitReleaseUseCase(this.releaseRepository, this.trackRepository);
      const submittedRelease = await useCase.execute(id);
      reply.send(submittedRelease);
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  }

  async approveRelease(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const useCase = new ApproveReleaseUseCase(this.releaseRepository);
      const { id } = request.params as { id: string };
      const approvedRelease = await useCase.execute(id);
      reply.send(approvedRelease);
    } catch (error) {
      this.handleUseCaseError(reply, error as Error);
    }
  }

  async rejectRelease(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const useCase = new RejectReleaseUseCase(this.releaseRepository);
      const { id } = request.params as { id: string };
      const rejectedRelease = await useCase.execute(id);
      reply.send(rejectedRelease);
    } catch (error) {
      this.handleUseCaseError(reply, error as Error);
    }
  }

  private handleUseCaseError(reply: FastifyReply, error: Error) {
    if (error instanceof ResourceNotFoundError) {
      reply.status(404).send({ error: error.message });
      return;
    }

    if (error instanceof InvalidStateError) {
      reply.status(409).send({ error: error.message });
      return;
    }

    reply.status(400).send({ error: error.message });
  }

  async uploadCoverArt(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    const data = await request.file();
    
    if (!data) {
      reply.status(400).send({ error: 'No file uploaded' });
      return;
    }

    // Verify ownership
    const { id } = request.params as { id: string };
    const release = await this.verifyReleaseAccess(request, reply, id);
    if (!release) return;

    try {
      const buffer = await data.toBuffer();
      const useCase = new UploadCoverArtUseCase(this.releaseRepository, this.cloudStorage);
      const url = await useCase.execute(id, buffer, data.filename);
      
      reply.send({ url });
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  }

    async subscribeToUpdates(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    // Set SSE headers
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    // Fetch initial release list
    const useCase = new ListReleasesUseCase(this.releaseRepository);
    const artistId = request.user!.role === UserRole.ARTIST ? request.user!.userId : undefined;
    const result = await useCase.execute({ artistId, page: 1, limit: 1000 });

    // Send initial data
    reply.raw.write(`data: ${JSON.stringify({ type: 'initial', releases: result.releases })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
      try {
        reply.raw.write(`: heartbeat\n\n`);
      } catch (error) {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30 second heartbeat

    // Cleanup on disconnect
    request.socket.on('close', () => {
      clearInterval(heartbeatInterval);
    });
  }

  private async verifyReleaseAccess(
    request: AuthenticatedRequest,
    reply: FastifyReply,
    releaseId: string
  ) {
    const release = await this.releaseRepository.findById(releaseId);

    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return null;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return null;
    }

    return release;
  }
}
