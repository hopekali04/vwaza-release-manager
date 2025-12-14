import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { UpdateReleaseRequestDto, ReleaseResponseDto } from '@vwaza/shared';

export class UpdateReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string, request: UpdateReleaseRequestDto): Promise<ReleaseResponseDto | null> {
    const release = await this.releaseRepository.update(releaseId, {
      title: request.title,
      genre: request.genre,
      coverArtUrl: request.coverArtUrl,
    });

    if (!release) {
      return null;
    }

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
