import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CreateReleaseRequestDto, ReleaseResponseDto } from '@vwaza/shared';

export class CreateReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(artistId: string, request: CreateReleaseRequestDto): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.create({
      artistId,
      title: request.title,
      genre: request.genre,
    });

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
