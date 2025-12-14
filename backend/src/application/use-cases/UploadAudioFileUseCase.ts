import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { UploadJobType } from '@vwaza/shared';

export class UploadAudioFileUseCase {
  constructor(
    private trackRepository: ITrackRepository,
    private cloudStorage: CloudStorageService
  ) {}

  async execute(trackId: string, file: Buffer, filename: string): Promise<{ url: string; duration: number }> {
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

    // Upload to cloud storage
    const { url, duration } = await this.cloudStorage.uploadFile(
      file,
      filename,
      UploadJobType.AUDIO
    );

    // Update track with audio URL and duration
    await this.trackRepository.update(trackId, {
      audioFileUrl: url,
      durationSeconds: duration || 0,
    });

    return { url, duration: duration || 0 };
  }
}
