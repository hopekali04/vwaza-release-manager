import { randomUUID } from 'crypto';
import { createLogger } from '@shared/logger';
import { loadConfig } from '@config/index';
import { UploadJobType } from '@vwaza/shared';

/**
 * Simulated Cloud Storage Service
 * later on, this will integrate with AWS S3.
 * For now, it generates mock URLs and simulates upload delays
 */
export class CloudStorageService {
  private logger = createLogger(loadConfig());
  private baseUrl = 'https://mock-cdn.vwaza.com';

  /**
   * Simulate file upload to cloud storage
   * @param buffer File buffer
   * @param filename Original filename
   * @param type Upload type (AUDIO or COVER_ART)
   * @returns Simulated CDN URL
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    type: UploadJobType
  ): Promise<{ url: string; duration?: number }> {
    // Simulate upload delay (1-3 seconds)
    const uploadDelay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, uploadDelay));

    // Generate a unique file key
    const fileExtension = filename.split('.').pop();
    const uniqueKey = `${randomUUID()}.${fileExtension}`;
    const folder = type === UploadJobType.AUDIO ? 'audio' : 'covers';
    
    const url = `${this.baseUrl}/${folder}/${uniqueKey}`;

    this.logger.info(
      { filename, type, url, size: buffer.length },
      'File uploaded to simulated cloud storage'
    );

    // For audio files, simulate metadata extraction (duration)
    let duration: number | undefined;
    if (type === UploadJobType.AUDIO) {
      // Simulate random duration between 2-5 minutes
      duration = Math.floor(Math.random() * 180) + 120;
      
      this.logger.info(
        { filename, duration },
        'Extracted audio metadata (simulated)'
      );
    }

    return { url, duration };
  }

  /**
   * Validate file type
   */
  validateFileType(filename: string, type: UploadJobType): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (type === UploadJobType.AUDIO) {
      return ['mp3', 'wav', 'flac', 'm4a', 'aac'].includes(extension || '');
    } else {
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, type: UploadJobType): boolean {
    const maxSizeAudio = 100 * 1024 * 1024; // 100MB
    const maxSizeCover = 10 * 1024 * 1024;  // 10MB
    
    return type === UploadJobType.AUDIO 
      ? size <= maxSizeAudio 
      : size <= maxSizeCover;
  }
}
