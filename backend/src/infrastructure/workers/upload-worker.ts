import { getDatabasePool } from '@infrastructure/database';
import { UploadJobStatus, UploadJobType } from '@vwaza/shared';
import { createLogger } from '@shared/logger';
import { loadConfig } from '@config/index';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import type { PoolClient } from 'pg';

interface UploadJob {
  id: string;
  targetEntityId: string;
  jobType: UploadJobType;
  localPath: string;
  status: UploadJobStatus;
  retryCount: number;
  errorLog: string | null;
  updatedAt: Date;
}

const MAX_RETRIES = 3;
const POLL_INTERVAL = 5000; // Check for new jobs every 5 seconds
const STUCK_JOB_TIMEOUT = 5 * 60 * 1000; // 5 minutes - if UPLOADING for longer, consider stuck

export class UploadWorker {
  private isRunning = false;
  private logger = createLogger(loadConfig());
  private cloudStorageService = new CloudStorageService();

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Upload worker is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Upload worker started');
    
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(() => {
      this.recoverStuckJobs().catch((error) => {
        this.logger.error({ error }, 'Error recovering stuck jobs');
      });
      
      this.processPendingJobs().catch((error) => {
        this.logger.error({ error }, 'Error processing upload jobs');
      });
    }, POLL_INTERVAL);
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info('Upload worker stopped');
  }

  /**
   * Recover stuck jobs that have been in UPLOADING state for too long
   */
  private async recoverStuckJobs(): Promise<void> {
    const pool = getDatabasePool();
    
    // Find jobs stuck in UPLOADING for more than STUCK_JOB_TIMEOUT
    const stuckCutoff = new Date(Date.now() - STUCK_JOB_TIMEOUT);
    
    const result = await pool.query<UploadJob>(
      `SELECT * FROM upload_jobs 
       WHERE status = $1 
       AND updated_at < $2`,
      [UploadJobStatus.UPLOADING, stuckCutoff]
    );

    if (result.rows.length > 0) {
      this.logger.warn(
        { count: result.rows.length },
        'Found stuck upload jobs, resetting to PENDING'
      );

      for (const job of result.rows) {
        await pool.query(
          `UPDATE upload_jobs 
           SET status = $1, 
               error_log = $2,
               updated_at = NOW()
           WHERE id = $3`,
          [
            UploadJobStatus.PENDING,
            'Job was stuck in UPLOADING state and has been reset',
            job.id
          ]
        );
        
        this.logger.info({ jobId: job.id }, 'Reset stuck job to PENDING');
      }
    }
  }

  private async processPendingJobs(): Promise<void> {
    const pool = getDatabasePool();
    
    const result = await pool.query<UploadJob>(
      `SELECT * FROM upload_jobs 
       WHERE status = $1 
       ORDER BY created_at ASC 
       LIMIT 10`,
      [UploadJobStatus.PENDING]
    );

    for (const job of result.rows) {
      await this.processJob(job);
    }
  }

  private async processJob(job: UploadJob): Promise<void> {
    const pool = getDatabasePool();
    const client = await pool.connect();
    
    try {
      this.logger.info({ jobId: job.id, jobType: job.jobType }, 'Processing upload job');
      
      // Begin transaction
      await client.query('BEGIN');

      // Update status to UPLOADING
      await client.query(
        'UPDATE upload_jobs SET status = $1, updated_at = NOW() WHERE id = $2',
        [UploadJobStatus.UPLOADING, job.id]
      );

      // Upload to Supabase
      const { url, duration } = await this.performUpload(job);

      // Update the target entity with the file URL (within transaction)
      await this.updateEntityWithUrl(client, job, url, duration);

      // Mark as completed
      await client.query(
        'UPDATE upload_jobs SET status = $1, updated_at = NOW() WHERE id = $2',
        [UploadJobStatus.COMPLETED, job.id]
      );

      // Commit transaction
      await client.query('COMMIT');

      this.logger.info({ jobId: job.id }, 'Upload job completed successfully');
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');
      await this.handleJobFailure(job, error);
    } finally {
      client.release();
    }
  }

  private async performUpload(job: UploadJob): Promise<{ url: string; duration?: number }> {
    const buffer = await readFile(job.localPath);
    const filename = basename(job.localPath);
    return this.cloudStorageService.uploadFile(buffer, filename, job.jobType);
  }

  private async updateEntityWithUrl(client: PoolClient, job: UploadJob, url: string, duration?: number): Promise<void> {
    if (job.jobType === UploadJobType.AUDIO) {
      // Update track's audio_file_url and duration if available
      if (duration) {
         await client.query(
          'UPDATE tracks SET audio_file_url = $1, duration_seconds = $2, updated_at = NOW() WHERE id = $3',
          [url, duration, job.targetEntityId]
        );
      } else {
        await client.query(
          'UPDATE tracks SET audio_file_url = $1, updated_at = NOW() WHERE id = $2',
          [url, job.targetEntityId]
        );
      }
    } else if (job.jobType === UploadJobType.COVER_ART) {
      // Update release's cover_art_url
      await client.query(
        'UPDATE releases SET cover_art_url = $1, updated_at = NOW() WHERE id = $2',
        [url, job.targetEntityId]
      );
    }
  }

  private async handleJobFailure(job: UploadJob, error: unknown): Promise<void> {
    const pool = getDatabasePool();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    this.logger.error(
      { jobId: job.id, retryCount: job.retryCount, error: errorMessage },
      'Upload job failed'
    );

    if (job.retryCount >= MAX_RETRIES) {
      // Mark as permanently failed
      await pool.query(
        'UPDATE upload_jobs SET status = $1, error_log = $2, updated_at = NOW() WHERE id = $3',
        [UploadJobStatus.FAILED, errorMessage, job.id]
      );
      this.logger.error({ jobId: job.id }, 'Upload job permanently failed after max retries');
    } else {
      // Retry: reset to PENDING and increment retry count
      await pool.query(
        'UPDATE upload_jobs SET status = $1, retry_count = $2, error_log = $3, updated_at = NOW() WHERE id = $4',
        [UploadJobStatus.PENDING, job.retryCount + 1, errorMessage, job.id]
      );
      this.logger.info({ jobId: job.id, retryCount: job.retryCount + 1 }, 'Job queued for retry');
    }
  }
}
