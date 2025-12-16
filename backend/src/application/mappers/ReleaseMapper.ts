import { Release } from '@domain/entities/Release.js';
import { ReleaseResponseDto } from '@vwaza/shared';

/**
 * Maps Release entity to ReleaseResponseDto
 * Centralizes DTO conversion logic to avoid duplication across use cases
 */
export class ReleaseMapper {
  static toDTO(release: Release): ReleaseResponseDto {
    return {
      id: release.id,
      artistId: release.artistId,
      title: release.title,
      genre: release.genre,
      coverArtUrl: release.coverArtUrl,
      status: release.status,
      createdAt: release.createdAt.toISOString(),
      updatedAt: release.updatedAt.toISOString(),
    };
  }
}
