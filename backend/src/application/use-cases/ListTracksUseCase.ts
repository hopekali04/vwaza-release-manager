import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { TrackResponseDto } from '@vwaza/shared';

export class ListTracksUseCase {
  constructor(private trackRepository: ITrackRepository) {}

  async execute(releaseId: string): Promise<TrackResponseDto[]> {
    const tracks = await this.trackRepository.findByReleaseId(releaseId);

    return tracks.map((track) => ({
      id: track.id,
      releaseId: track.releaseId,
      title: track.title,
      isrc: track.isrc,
      audioFileUrl: track.audioFileUrl,
      durationSeconds: track.durationSeconds,
      trackOrder: track.trackOrder,
      createdAt: track.createdAt.toISOString(),
      updatedAt: track.updatedAt.toISOString(),
    }));
  }
}
