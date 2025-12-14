import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { UploadJobType, ReleaseStatus } from '@vwaza/shared';

export class UploadCoverArtUseCase {
  constructor(
    private releaseRepository: IReleaseRepository,
    private cloudStorage: CloudStorageService
  ) {}

  async execute(releaseId: string, file: Buffer, filename: string): Promise<string> {
    // Validate file type
    if (!this.cloudStorage.validateFileType(filename, UploadJobType.COVER_ART)) {
      throw new Error('Invalid image file type. Supported: jpg, jpeg, png, webp');
    }

    // Validate file size
    if (!this.cloudStorage.validateFileSize(file.length, UploadJobType.COVER_ART)) {
      throw new Error('Cover art file too large. Maximum size: 10MB');
    }

    // Verify release exists and is in DRAFT status
    const release = await this.releaseRepository.findById(releaseId);
    if (!release) {
      throw new Error('Release not found');
    }

    if (release.status !== ReleaseStatus.DRAFT) {
      throw new Error('Cover art can only be uploaded for draft releases');
    }

    // Upload to cloud storage
    const { url } = await this.cloudStorage.uploadFile(
      file,
      filename,
      UploadJobType.COVER_ART
    );

    // Update release with cover art URL
    await this.releaseRepository.update(releaseId, {
      coverArtUrl: url,
    });

    return url;
  }
}
