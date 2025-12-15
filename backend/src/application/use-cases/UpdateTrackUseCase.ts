import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { UpdateTrackRequestDto, TrackResponseDto } from '@vwaza/shared';
import { TrackMapper } from '@application/mappers/TrackMapper.js';

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

    return TrackMapper.toDTO(track);
  }
}
