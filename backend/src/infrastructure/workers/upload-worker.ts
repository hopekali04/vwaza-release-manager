import { getDatabasePool } from '@infrastructure/database';
import { UploadJobStatus, UploadJobType } from '@vwaza/shared';
import { createLogger } from '@shared/logger';
import { loadConfig } from '@config/index';

interface UploadJob {
  id: string;
  targetEntityId: string;
  jobType: UploadJobType;
  localPath: string;
  status: UploadJobStatus;
  retryCount: number;
  errorLog: string | null;
}

const MAX_RETRIES = 3;
const POLL_INTERVAL = 5000; // Check for new jobs every 5 seconds
const SIMULATED_UPLOAD_TIME = 3000; // Simulate 3s upload time

export class UploadWorker {
  private isRunning = false;
  private logger = createLogger(loadConfig());

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Upload worker is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Upload worker started');
    
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(() => {
      this.processPendingJobs().catch((error) => {
        this.logger.error({ error }, 'Error processing upload jobs');
      });
    }, POLL_INTERVAL);
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info('Upload worker stopped');
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
    
    try {
      this.logger.info({ jobId: job.id, jobType: job.jobType }, 'Processing upload job');
      
      // Update status to UPLOADING
      await pool.query(
        'UPDATE upload_jobs SET status = $1 WHERE id = $2',
        [UploadJobStatus.UPLOADING, job.id]
      );

      // Simulate upload to S3 (replace with actual S3 upload in production)
      await this.simulateUpload(job);

      // Mark as completed
      await pool.query(
        'UPDATE upload_jobs SET status = $1 WHERE id = $2',
        [UploadJobStatus.COMPLETED, job.id]
      );

      // Update the target entity with the file URL
      await this.updateEntityWithUrl(job);

      this.logger.info({ jobId: job.id }, 'Upload job completed successfully');
    } catch (error) {
      await this.handleJobFailure(job, error);
    }
  }

  private async simulateUpload(_job: UploadJob): Promise<void> {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_UPLOAD_TIME));
    
    // In production, this would be:
    // const s3Service = new S3Service();
    // const fileUrl = await s3Service.uploadFile(job.localPath, job.jobType);
    // return fileUrl;
  }

  private async updateEntityWithUrl(job: UploadJob): Promise<void> {
    const pool = getDatabasePool();
    const mockUrl = `https://s3.amazonaws.com/vwaza-uploads/${job.id}`;

    if (job.jobType === UploadJobType.AUDIO) {
      // Update track's audio_file_url
      await pool.query(
        'UPDATE tracks SET audio_file_url = $1 WHERE id = $2',
        [mockUrl, job.targetEntityId]
      );
    } else if (job.jobType === UploadJobType.COVER_ART) {
      // Update release's cover_art_url
      await pool.query(
        'UPDATE releases SET cover_art_url = $1 WHERE id = $2',
        [mockUrl, job.targetEntityId]
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
        'UPDATE upload_jobs SET status = $1, error_log = $2 WHERE id = $3',
        [UploadJobStatus.FAILED, errorMessage, job.id]
      );
      this.logger.error({ jobId: job.id }, 'Upload job permanently failed after max retries');
    } else {
      // Retry: reset to PENDING and increment retry count
      await pool.query(
        'UPDATE upload_jobs SET status = $1, retry_count = $2, error_log = $3 WHERE id = $4',
        [UploadJobStatus.PENDING, job.retryCount + 1, errorMessage, job.id]
      );
      this.logger.info({ jobId: job.id, retryCount: job.retryCount + 1 }, 'Job queued for retry');
    }
  }
}
