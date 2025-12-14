import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { UpdateTrackRequestDto, TrackResponseDto } from '@vwaza/shared';

export class UpdateTrackUseCase {
  constructor(private trackRepository: ITrackRepository) {}

  async execute(trackId: string, request: UpdateTrackRequestDto): Promise<TrackResponseDto | null> {
    const track = await this.trackRepository.update(trackId, {
      title: request.title,
      trackOrder: request.trackOrder,
      isrc: request.isrc,
      durationSeconds: request.durationSeconds,
    });

    if (!track) {
      return null;
    }

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
