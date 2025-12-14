import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CreateTrackRequestDto, TrackResponseDto, ReleaseStatus } from '@vwaza/shared';

export class CreateTrackUseCase {
  constructor(
    private trackRepository: ITrackRepository,
    private releaseRepository: IReleaseRepository
  ) {}

  async execute(releaseId: string, request: CreateTrackRequestDto): Promise<TrackResponseDto> {
    // Verify release exists and is in DRAFT status
    const release = await this.releaseRepository.findById(releaseId);
    
    if (!release) {
      throw new Error('Release not found');
    }

    if (release.status !== ReleaseStatus.DRAFT) {
      throw new Error('Tracks can only be added to draft releases');
    }

    const track = await this.trackRepository.create({
      releaseId,
      title: request.title,
      trackOrder: request.trackOrder,
      isrc: request.isrc,
    });

    return {
      id: track.id,
      releaseId: track.releaseId,
      title: track.title,
      isrc: track.isrc,
      audioFileUrl: track.audioFileUrl,
      durationSeconds: track.durationSeconds,
      trackOrder: track.trackOrder,
      createdAt: track.createdAt.toISOString(),
      updatedAt: track.updatedAt.toISOString(),
    };
  }
}
