import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { UploadJobType } from '@vwaza/shared';
import { getDatabasePool } from '@infrastructure/database/index.js';

export class UploadAudioFileUseCase {
  constructor(
    private trackRepository: ITrackRepository,
    private cloudStorage: CloudStorageService
  ) {}

  async execute(
    trackId: string,
    file: Buffer,
    filename: string
  ): Promise<{ url: string; duration: number }> {
    // Validate file type
    if (!this.cloudStorage.validateFileType(filename, UploadJobType.AUDIO)) {
      throw new Error('Invalid audio file type. Supported: mp3, wav, flac, m4a, aac');
    }

    // Validate file size
    if (!this.cloudStorage.validateFileSize(file.length, UploadJobType.AUDIO)) {
      throw new Error('Audio file too large. Maximum size: 100MB');
    }

    // Verify track exists
    const track = await this.trackRepository.findById(trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    const pool = getDatabasePool();
    const client = await pool.connect();
    let uploadedUrl: string | null = null;

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Upload to cloud storage first
      const { url, duration } = await this.cloudStorage.uploadFile(
        file,
        filename,
        UploadJobType.AUDIO
      );
      uploadedUrl = url;

      // Update track with audio URL and duration using repository
      await this.trackRepository.update(
        trackId,
        {
          audioFileUrl: url,
          durationSeconds: duration || 0,
        },
        client
      );

      // Commit transaction
      await client.query('COMMIT');

      return { url, duration: duration || 0 };
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
