import { getDatabasePool } from '@infrastructure/database/index.js';
import { ReleaseStatus } from '@vwaza/shared';
import { createLogger } from '@shared/logger.js';
import { loadConfig } from '@config/index.js';

interface ProcessingRelease {
  id: string;
  artistId: string;
  title: string;
  trackCount: number;
}

const POLL_INTERVAL = 10000; // Check every 10 seconds
const SIMULATED_PROCESSING_TIME = 7000; // Simulate 7s processing time per release (transcoding + metadata extraction)

export class ProcessingWorker {
  private isRunning = false;
  private isProcessing = false;
  private logger = createLogger(loadConfig());

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Processing worker is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Processing worker started');
    
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(() => {
      if (!this.isProcessing) {
        this.processReleases().catch((error) => {
          this.logger.error({ error }, 'Error processing releases');
        });
      }
    }, POLL_INTERVAL);
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info('Processing worker stopped');
  }

  private async processReleases(): Promise<void> {
    this.isProcessing = true;
    try {
      const pool = getDatabasePool();
      
      // Find releases in PROCESSING state
      const result = await pool.query<ProcessingRelease>(
        `SELECT 
           r.id, 
           r.artist_id AS "artistId",
           r.title,
           COUNT(t.id) AS "trackCount"
         FROM releases r
         LEFT JOIN tracks t ON t.release_id = r.id
         WHERE r.status = $1
         GROUP BY r.id, r.artist_id, r.title`,
        [ReleaseStatus.PROCESSING]
      );

      for (const row of result.rows) {
        const release: ProcessingRelease = {
          ...row,
          trackCount: parseInt(String(row.trackCount), 10)
        };
        await this.processRelease(release);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processRelease(release: ProcessingRelease): Promise<void> {
    const pool = getDatabasePool();
    
    try {
      this.logger.info(
        { releaseId: release.id, title: release.title },
        'Processing release'
      );
      
      // Simulate transcoding/processing
      await this.simulateProcessing();

      // Check if all tracks have audio files uploaded
      const tracksResult = await pool.query(
        `SELECT COUNT(*) as count 
         FROM tracks 
         WHERE release_id = $1 AND audio_file_url IS NOT NULL AND audio_file_url != ''`,
        [release.id]
      );
      
      const uploadedTracksCount = parseInt(tracksResult.rows[0].count, 10);

      if (uploadedTracksCount === release.trackCount && release.trackCount > 0) {
        // All tracks processed, move to PENDING_REVIEW
        await pool.query(
          'UPDATE releases SET status = $1 WHERE id = $2',
          [ReleaseStatus.PENDING_REVIEW, release.id]
        );
        
        this.logger.info(
          { releaseId: release.id, title: release.title },
          'Release processing completed, moved to PENDING_REVIEW'
        );
      } else {
        this.logger.info(
          { 
            releaseId: release.id, 
            uploadedTracks: uploadedTracksCount,
            totalTracks: release.trackCount 
          },
          'Release still processing, waiting for all tracks'
        );
      }
    } catch (error) {
      this.logger.error(
        { releaseId: release.id, error },
        'Failed to process release'
      );
    }
  }

  private async simulateProcessing(): Promise<void> {
    // Simulate processing delay (transcoding, metadata extraction, etc.)
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_PROCESSING_TIME));
    
    // later on, this would include:
    // - Audio transcoding to multiple formats
    // - Metadata extraction (duration, bitrate, etc.)
    // - Audio quality validation
    // - Waveform generation
  }
}
