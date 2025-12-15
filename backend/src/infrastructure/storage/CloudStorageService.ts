import { randomUUID } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { parseBuffer } from 'music-metadata';
import { lookup as mimeLookup } from 'mime-types';
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
  private supabase: SupabaseClient;
  private bucket: string;

  constructor() {
    const config = loadConfig();
    this.supabase = createClient(config.supabase.url, config.supabase.key);
    this.bucket = config.supabase.bucket;
  }

  /**
   * Upload file to Supabase Storage
   * @param buffer File buffer
   * @param filename Original filename
   * @param type Upload type (AUDIO or COVER_ART)
   * @returns Public URL and optional duration
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    type: UploadJobType
  ): Promise<{ url: string; duration?: number }> {
    const fileExt = filename.split('.').pop()?.toLowerCase();
    const uniqueId = randomUUID();
    const safeExt = fileExt ?? 'bin';
    // Organize files by type: audio/uuid.mp3 or cover_art/uuid.jpg
    const path = `${type.toLowerCase()}/${uniqueId}.${safeExt}`;

    // Determine content type using mime-types for broader coverage
    const lookedUp = mimeLookup(filename);
    const contentType = typeof lookedUp === 'string' ? lookedUp : 'application/octet-stream';

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      this.logger.error({ error, filename }, 'Failed to upload file to Supabase Storage');
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    let duration: number | undefined;

    if (type === UploadJobType.AUDIO) {
      try {
        // Extract actual duration from audio file buffer
        const metadata = await parseBuffer(buffer, { mimeType: contentType });
        if (metadata.format.duration) {
          duration = Math.floor(metadata.format.duration);
        }
        
        this.logger.info(
          { filename, duration, publicUrl },
          'Uploaded audio file to Supabase'
        );
      } catch (error) {
        this.logger.error(
          { error, filename },
          'Failed to extract audio metadata, duration will be undefined'
        );
      }
    } else {
      this.logger.info(
        { filename, publicUrl },
        'Uploaded image file to Supabase'
      );
    }

    return { url: publicUrl, duration };
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
