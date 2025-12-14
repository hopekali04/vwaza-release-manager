import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ReleaseStatus, ReleaseResponseDto } from '@vwaza/shared';

export class RejectReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.findById(releaseId);
    
    if (!release) {
      throw new Error('Release not found');
    }

    if (release.status !== ReleaseStatus.PENDING_REVIEW) {
      throw new Error('Only releases pending review can be rejected');
    }

    const updatedRelease = await this.releaseRepository.updateStatus(
      releaseId,
      ReleaseStatus.REJECTED
    );

    if (!updatedRelease) {
      throw new Error('Failed to reject release');
    }

    return {
      id: updatedRelease.id,
      artistId: updatedRelease.artistId,
      title: updatedRelease.title,
      genre: updatedRelease.genre,
      coverArtUrl: updatedRelease.coverArtUrl,
      status: updatedRelease.status,
      createdAt: updatedRelease.createdAt.toISOString(),
      updatedAt: updatedRelease.updatedAt.toISOString(),
    };
  }
}
