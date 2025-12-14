# Background Workers Documentation

This document explains the background worker architecture for async processing in Vwaza Release Manager.

## Overview

The application uses two background workers that run independently from the HTTP server:

1. **Upload Worker** - Handles file uploads to cloud storage (S3)
2. **Processing Worker** - Simulates audio processing and moves releases through the pipeline

## Architecture

### Worker Manager (`infrastructure/workers/index.ts`)

The `WorkerManager` class coordinates all background workers:

```typescript
const workerManager = new WorkerManager();
await workerManager.startAll(); // Start all workers
workerManager.stopAll(); // Stop all workers
```

Workers are automatically started when the server starts and stopped during graceful shutdown.

## Upload Worker

**File**: `infrastructure/workers/upload-worker.ts`

**Purpose**: Processes pending upload jobs from the `upload_jobs` table.

**Flow**:
1. Polls database every 5 seconds for `PENDING` jobs
2. Updates job status to `UPLOADING`
3. Uploads file to S3 (currently simulated with 3s delay)
4. Updates job status to `COMPLETED`
5. Updates target entity (Track or Release) with file URL

**Retry Logic**:
- Max 3 retries per job
- Failed jobs return to `PENDING` with incremented `retry_count`
- Permanently failed jobs marked as `FAILED` after max retries

**Configuration**:
```typescript
const MAX_RETRIES = 3;
const POLL_INTERVAL = 5000; // 5 seconds
const SIMULATED_UPLOAD_TIME = 3000; // 3 seconds
```

### How to Create Upload Jobs

From your use case or controller:

```typescript
import { getDatabasePool } from '@infrastructure/database';
import { UploadJobStatus, UploadJobType } from '@vwaza/shared';

const pool = getDatabasePool();
await pool.query(
  `INSERT INTO upload_jobs 
   (target_entity_id, job_type, local_path, status) 
   VALUES ($1, $2, $3, $4)`,
  [trackId, UploadJobType.AUDIO, '/tmp/uploads/audio.mp3', UploadJobStatus.PENDING]
);
```

The worker will automatically pick it up within 5 seconds.

## Processing Worker

**File**: `infrastructure/workers/processing-worker.ts`

**Purpose**: Moves releases from `PROCESSING` to `PENDING_REVIEW` status.

**Flow**:
1. Polls database every 10 seconds for releases in `PROCESSING` state
2. Simulates audio processing (7s delay per release)
3. Checks if all tracks have uploaded audio files
4. If complete, moves release to `PENDING_REVIEW`
5. If incomplete, logs progress and waits for next cycle

**Configuration**:
```typescript
const POLL_INTERVAL = 10000; // 10 seconds
const SIMULATED_PROCESSING_TIME = 7000; // 7 seconds
```

### Status Flow

```
Artist submits release → Status changes to PROCESSING
↓
Processing Worker detects PROCESSING release
↓
Simulates transcoding (7s)
↓
Checks: Are all tracks uploaded?
├─ Yes → Move to PENDING_REVIEW
└─ No  → Keep in PROCESSING, check again in 10s
```

## Production Considerations

### Current Implementation (MVP)
- **Upload**: Simulated with `setTimeout`
- **Processing**: Simulated with `setTimeout`
- **Polling**: Simple `setInterval` loops

### Production Migration Path

1. **Replace Simulated Uploads** (Using Supabase Storage):
```typescript
// Already implemented in upload-worker.ts
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService';

const cloudStorage = new CloudStorageService();
const buffer = await readFile(job.localPath);
const { url, duration } = await cloudStorage.uploadFile(
  buffer,
  basename(job.localPath),
  job.jobType
);
```

2. **Add Real Processing**:
```typescript
// Use FFmpeg for audio transcoding
import ffmpeg from 'fluent-ffmpeg';

await new Promise((resolve, reject) => {
  ffmpeg(inputPath)
    .toFormat('mp3')
    .audioBitrate(320)
    .on('end', resolve)
    .on('error', reject)
    .save(outputPath);
});
```

3. **Migrate to Message Queue** (RabbitMQ, BullMQ, or AWS SQS):
```typescript
// Instead of polling database
import { Queue } from 'bullmq';

const uploadQueue = new Queue('uploads', {
  connection: { host: 'localhost', port: 6379 }
});

// Producer (in controller)
await uploadQueue.add('upload-file', { jobId, filePath });

// Consumer (worker)
uploadQueue.process('upload-file', async (job) => {
  await uploadToS3(job.data);
});
```

## Monitoring & Debugging

### Check Worker Status

Workers log activity to `logs/app.log`:

```bash
# Tail worker logs
tail -f backend/logs/app.log | grep -E 'worker|upload|processing'
```

### Database Queries for Debugging

```sql
-- Check pending upload jobs
SELECT * FROM upload_jobs WHERE status = 'PENDING';

-- Check releases stuck in processing
SELECT r.*, COUNT(t.id) as track_count
FROM releases r
LEFT JOIN tracks t ON t.release_id = r.id
WHERE r.status = 'PROCESSING'
GROUP BY r.id;

-- Check failed uploads
SELECT * FROM upload_jobs 
WHERE status = 'FAILED' 
ORDER BY updated_at DESC;
```

### Manual Worker Trigger

For testing, you can manually trigger workers:

```typescript
import { UploadWorker } from '@infrastructure/workers';

const worker = new UploadWorker();
await worker.start();
```

## Graceful Shutdown

Workers stop automatically on server shutdown:

```typescript
server.addHook('onClose', async () => {
  workerManager.stopAll();
  await closeDatabasePool();
});
```

This prevents orphaned jobs during deployment.
