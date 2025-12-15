import { FastifyReply } from 'fastify';
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
} from '@vwaza/shared';

export class ReleaseController {
  private releaseRepository = new ReleaseRepository();
  private trackRepository = new TrackRepository();
  private cloudStorage = new CloudStorageService();

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
    const useCase = new ListReleasesUseCase(this.releaseRepository);
    
    // Parse query params
    const query = request.query as any;
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const status = query.status as any;
    
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
      reply.status(400).send({ error: (error as Error).message });
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
      reply.status(400).send({ error: (error as Error).message });
    }
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
