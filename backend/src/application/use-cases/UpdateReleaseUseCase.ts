import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { UpdateReleaseRequestDto, ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';

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

    return ReleaseMapper.toDTO(release);
  }
}
