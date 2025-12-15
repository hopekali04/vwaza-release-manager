import { Track } from '@domain/entities/Track.js';
import { TrackResponseDto } from '@vwaza/shared';

/**
 * Maps Track entity to TrackResponseDto
 * Centralizes DTO conversion logic to avoid duplication across use cases
 */
export class TrackMapper {
  static toDTO(track: Track): TrackResponseDto {
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
