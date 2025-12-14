import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseResponseDto } from '@vwaza/shared';

export class ListReleasesUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(artistId?: string): Promise<Array<ReleaseResponseDto & { trackCount: number }>> {
    const releases = await this.releaseRepository.getReleasesWithTrackCount(artistId);

    return releases.map((release) => ({
      id: release.id,
      artistId: release.artistId,
      title: release.title,
      genre: release.genre,
      coverArtUrl: release.coverArtUrl,
      status: release.status,
      createdAt: release.createdAt.toISOString(),
      updatedAt: release.updatedAt.toISOString(),
      trackCount: release.trackCount,
    }));
  }
}
