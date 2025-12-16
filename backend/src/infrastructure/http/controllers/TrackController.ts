import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '@infrastructure/auth/middleware.js';
import { TrackRepository } from '@infrastructure/repositories/TrackRepository.js';
import { ReleaseRepository } from '@infrastructure/repositories/ReleaseRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { CreateTrackUseCase } from '@application/use-cases/CreateTrackUseCase.js';
import { ListTracksUseCase } from '@application/use-cases/ListTracksUseCase.js';
import { UpdateTrackUseCase } from '@application/use-cases/UpdateTrackUseCase.js';
import { DeleteTrackUseCase } from '@application/use-cases/DeleteTrackUseCase.js';
import { UploadAudioFileUseCase } from '@application/use-cases/UploadAudioFileUseCase.js';
import { createTrackRequestSchema, updateTrackRequestSchema, UserRole } from '@vwaza/shared';

export class TrackController {
  private trackRepository = new TrackRepository();
  private releaseRepository = new ReleaseRepository();
  private cloudStorage = new CloudStorageService();

  async createTrack(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const result = createTrackRequestSchema.safeParse(request.body);

    if (!result.success) {
      reply.status(400).send({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    // Verify release ownership
    const { releaseId } = request.params as { releaseId: string };
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    try {
      const useCase = new CreateTrackUseCase(this.trackRepository, this.releaseRepository);
      const track = await useCase.execute(releaseId, result.data);
      reply.status(201).send(track);
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  }

  async listTracks(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    // Verify release access
    const { releaseId } = request.params as { releaseId: string };
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    const useCase = new ListTracksUseCase(this.trackRepository);
    const tracks = await useCase.execute(releaseId);
    reply.send(tracks);
  }

  async updateTrack(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const result = updateTrackRequestSchema.safeParse(request.body);

    if (!result.success) {
      reply.status(400).send({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    // Verify track exists and check ownership via release
    const { id } = request.params as { id: string };
    const track = await this.trackRepository.findById(id);
    if (!track) {
      reply.status(404).send({ error: 'Track not found' });
      return;
    }

    const release = await this.releaseRepository.findById(track.releaseId);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    const useCase = new UpdateTrackUseCase(this.trackRepository);
    const updatedTrack = await useCase.execute(id, result.data);

    if (!updatedTrack) {
      reply.status(404).send({ error: 'Track not found' });
      return;
    }

    reply.send(updatedTrack);
  }

  async deleteTrack(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    // Verify track exists and check ownership via release
    const { id } = request.params as { id: string };
    const track = await this.trackRepository.findById(id);
    if (!track) {
      reply.status(404).send({ error: 'Track not found' });
      return;
    }

    const release = await this.releaseRepository.findById(track.releaseId);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    const useCase = new DeleteTrackUseCase(this.trackRepository);
    const deleted = await useCase.execute(id);

    if (!deleted) {
      reply.status(404).send({ error: 'Track not found' });
      return;
    }

    reply.status(204).send();
  }

  async uploadAudioFile(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    const data = await request.file();

    if (!data) {
      reply.status(400).send({ error: 'No file uploaded' });
      return;
    }

    // Verify track exists and check ownership via release
    const { id } = request.params as { id: string };
    const track = await this.trackRepository.findById(id);
    if (!track) {
      reply.status(404).send({ error: 'Track not found' });
      return;
    }

    const release = await this.releaseRepository.findById(track.releaseId);
    if (!release) {
      reply.status(404).send({ error: 'Release not found' });
      return;
    }

    if (request.user!.role === UserRole.ARTIST && release.artistId !== request.user!.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }

    try {
      const buffer = await data.toBuffer();
      const useCase = new UploadAudioFileUseCase(this.trackRepository, this.cloudStorage);
      const result = await useCase.execute(id, buffer, data.filename);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  }
}
