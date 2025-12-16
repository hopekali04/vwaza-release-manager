import { UploadWorker } from './upload-worker.js';
import { ProcessingWorker } from './processing-worker.js';
import { createLogger } from '@shared/logger.js';
import { loadConfig } from '@config/index.js';

export class WorkerManager {
  private uploadWorker: UploadWorker;
  private processingWorker: ProcessingWorker;
  private logger = createLogger(loadConfig());

  constructor() {
    this.uploadWorker = new UploadWorker();
    this.processingWorker = new ProcessingWorker();
  }

  async startAll(): Promise<void> {
    this.logger.info('Starting all background workers...');
    await this.uploadWorker.start();
    await this.processingWorker.start();
    this.logger.info('All background workers started successfully');
  }

  stopAll(): void {
    this.logger.info('Stopping all background workers...');
    this.uploadWorker.stop();
    this.processingWorker.stop();
    this.logger.info('All background workers stopped');
  }
}

export * from './upload-worker.js';
export * from './processing-worker.js';
