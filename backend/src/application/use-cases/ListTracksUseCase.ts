import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { TrackResponseDto } from '@vwaza/shared';
import { TrackMapper } from '@application/mappers/TrackMapper.js';

export class ListTracksUseCase {
  constructor(private trackRepository: ITrackRepository) {}

  async execute(releaseId: string): Promise<TrackResponseDto[]> {
    const tracks = await this.trackRepository.findByReleaseId(releaseId);

    return tracks.map((track) => TrackMapper.toDTO(track));
  }
}
