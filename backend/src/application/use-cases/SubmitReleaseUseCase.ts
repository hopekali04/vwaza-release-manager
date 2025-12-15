import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { ReleaseStatus, ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';

export class SubmitReleaseUseCase {
  constructor(
    private releaseRepository: IReleaseRepository,
    private trackRepository: ITrackRepository
  ) {}

  async execute(releaseId: string): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.findById(releaseId);
    
    if (!release) {
      throw new Error('Release not found');
    }

    if (release.status !== ReleaseStatus.DRAFT) {
      throw new Error('Only draft releases can be submitted');
    }

    // Check if release has cover art
    if (!release.coverArtUrl) {
      throw new Error('Release must have cover art before submission');
    }

    // Check if release has at least one track
    const trackCount = await this.trackRepository.countByReleaseId(releaseId);
    if (trackCount === 0) {
      throw new Error('Release must have at least one track before submission');
    }

    // Check if all tracks have audio files
    const tracks = await this.trackRepository.findByReleaseId(releaseId);
    const tracksWithoutAudio = tracks.filter(t => !t.audioFileUrl || t.audioFileUrl === '');
    
    if (tracksWithoutAudio.length > 0) {
      throw new Error('All tracks must have audio files before submission');
    }

    // Update status to PROCESSING
    const updatedRelease = await this.releaseRepository.updateStatus(
      releaseId,
      ReleaseStatus.PROCESSING
    );

    if (!updatedRelease) {
      throw new Error('Failed to update release status');
    }

    return ReleaseMapper.toDTO(updatedRelease);
  }
}
