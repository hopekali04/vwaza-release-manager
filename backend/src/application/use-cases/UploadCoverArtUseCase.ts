import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { UploadJobType, ReleaseStatus } from '@vwaza/shared';
import { getDatabasePool } from '@infrastructure/database';

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

    const pool = getDatabasePool();
    const client = await pool.connect();
    let uploadedUrl: string | null = null;

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Upload to cloud storage first
      const { url } = await this.cloudStorage.uploadFile(
        file,
        filename,
        UploadJobType.COVER_ART
      );
      uploadedUrl = url;

      // Update release with cover art URL using repository
      await this.releaseRepository.update(
        releaseId,
        { coverArtUrl: url },
        client
      );

      // Commit transaction
      await client.query('COMMIT');

      return url;
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');

      // Clean up uploaded file if DB update failed
      if (uploadedUrl) {
        await this.cloudStorage.deleteFile(uploadedUrl).catch((cleanupError) => {
          // Log but don't throw - cleanup is best-effort
          console.error('Failed to cleanup orphaned file:', uploadedUrl, cleanupError);
        });
      }

      throw error;
    } finally {
      client.release();
    }
  }
}
