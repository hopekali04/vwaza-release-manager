import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseStatus, ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';

export class ApproveReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.findById(releaseId);
    
    if (!release) {
      throw new Error('Release not found');
    }

    if (release.status !== ReleaseStatus.PENDING_REVIEW) {
      throw new Error('Only releases pending review can be approved');
    }

    const updatedRelease = await this.releaseRepository.updateStatus(
      releaseId,
      ReleaseStatus.PUBLISHED
    );

    if (!updatedRelease) {
      throw new Error('Failed to approve release');
    }

    return ReleaseMapper.toDTO(updatedRelease);
  }
}
