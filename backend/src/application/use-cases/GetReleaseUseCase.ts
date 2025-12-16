import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';

export class GetReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto | null> {
    const release = await this.releaseRepository.findById(releaseId);

    if (!release) {
      return null;
    }

    return ReleaseMapper.toDTO(release);
  }
}
