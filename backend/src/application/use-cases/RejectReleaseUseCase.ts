import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseStatus, ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';
import { ResourceNotFoundError, InvalidStateError } from '@application/errors/ApplicationErrors.js';

export class RejectReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.findById(releaseId);

    if (!release) {
      throw new ResourceNotFoundError('Release', releaseId);
    }

    if (release.status !== ReleaseStatus.PENDING_REVIEW) {
      throw new InvalidStateError('Only releases pending review can be rejected');
    }

    const updatedRelease = await this.releaseRepository.updateStatus(
      releaseId,
      ReleaseStatus.REJECTED
    );

    if (!updatedRelease) {
      throw new InvalidStateError('Failed to reject release');
    }

    return ReleaseMapper.toDTO(updatedRelease);
  }
}
