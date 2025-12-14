import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseResponseDto } from '@vwaza/shared';

export class GetReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto | null> {
    const release = await this.releaseRepository.findById(releaseId);
    
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
