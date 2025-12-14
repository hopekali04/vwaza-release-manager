import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { PaginatedReleasesResponse, GetReleasesParams as ListReleasesParams } from '@vwaza/shared';

export class ListReleasesUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(params?: ListReleasesParams): Promise<PaginatedReleasesResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const artistId = params?.artistId;
    const status = params?.status;

    const { releases, total } = await this.releaseRepository.getReleasesWithTrackCountPaginated(
      page,
      limit,
      artistId,
      status
    );

    const mappedReleases = releases.map((release) => ({
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

    return {
      releases: mappedReleases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
