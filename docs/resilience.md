# System Resilience & Fault Tolerance

## Overview

Vwaza Release Manager implements comprehensive resilience mechanisms to ensure data consistency and system stability during file upload operations and other critical workflows.

## Upload Resilience

### Direct Upload Flow (Cover Art & Audio Files)

#### Transaction-Based Atomicity
All upload operations use PostgreSQL transactions to ensure atomicity between cloud storage uploads and database updates.

```typescript
// Transaction flow:
1. BEGIN transaction
2. Upload file to Supabase Storage
3. Update database with file URL
4. COMMIT transaction
// If any step fails, ROLLBACK + cleanup
```

**Key Benefits:**
- Database stays consistent even if upload succeeds but DB update fails
- No orphaned database records pointing to non-existent files
- Automatic rollback on any error

#### Orphaned File Cleanup
If a file successfully uploads to Supabase but the database update fails:

```typescript
try {
  url = await cloudStorage.uploadFile(...)  // ✅ Succeeds
  await client.query('UPDATE ...')           // ❌ Fails
} catch (error) {
  await cloudStorage.deleteFile(url)        // 🧹 Cleanup
  throw error
}
```

**Implementation:**
- `CloudStorageService.deleteFile()` removes files from Supabase
- Best-effort cleanup (logged but doesn't block error propagation)
- Prevents storage bloat from failed transactions

### Background Worker Upload (Upload Jobs)

#### Job State Machine
```
PENDING → UPLOADING → COMPLETED
   ↓           ↓
   ↓      (retry) → PENDING (retry_count++)
   ↓           ↓
   └──────→ FAILED (after 3 retries)
```

#### Stuck Job Detection & Recovery
Background workers can crash mid-upload, leaving jobs in `UPLOADING` state indefinitely.

**Recovery Mechanism:**
- Every 5 seconds, worker checks for jobs in `UPLOADING` for >5 minutes
- Automatically resets stuck jobs to `PENDING`
- Logs stuck job detection for monitoring

```sql
-- Stuck job query
SELECT * FROM upload_jobs 
WHERE status = 'UPLOADING' 
  AND updated_at < (NOW() - INTERVAL '5 minutes')
```

#### Retry Logic
- **Max Retries:** 3 attempts per job
- **Backoff:** Jobs return to `PENDING` queue (implicit backoff via polling)
- **Error Logging:** Each failure logs error message for debugging
- **Final State:** After 3 failures → `FAILED` (permanent)

#### Transactional Worker Processing
Worker jobs use transactions to ensure upload + DB update atomicity:

```typescript
BEGIN transaction
  SET status = 'UPLOADING'
  Upload to cloud storage
  UPDATE entity with file URL
  SET status = 'COMPLETED'
COMMIT

// On error:
ROLLBACK
Reset to PENDING (if retries < 3)
```

**Key Protection:**
- No partial state (e.g., file uploaded but track not updated)
- Worker crash during upload = job stays `PENDING` or gets reset from `UPLOADING`
- Database and storage always in sync

## Rate Limiting

Protects API from abuse and ensures fair resource allocation.

### Global Rate Limits
- **100 requests/minute** per IP address
- Applied to all API endpoints
- localhost (127.0.0.1) whitelisted for development

### Auth Endpoint Limits
Stricter limits prevent brute-force attacks:
- **Signup:** 5 attempts per 15 minutes
- **Login:** 10 attempts per 15 minutes

**Response:**
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Database Performance

### Indexes on Critical Columns

#### Foreign Keys
```sql
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_tracks_release_id ON tracks(release_id);
```
- Optimizes JOINs for artist→releases and release→tracks
- Speeds up dashboard queries filtering by artist

#### Status Columns
```sql
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);
```
- Enables fast filtering (e.g., `WHERE status = 'PENDING_REVIEW'`)
- Critical for admin approval workflows and worker job queries

#### Authentication
```sql
CREATE INDEX idx_users_email ON users(email);
```
- Optimizes login lookups (email is unique identifier)

#### Cleanup Operations
```sql
CREATE INDEX idx_password_tokens_expires_at ON password_reset_tokens(expires_at);
```
- Enables efficient batch deletion of expired tokens

### Unique Constraints
- `unique_track_order_per_release`: Prevents duplicate track numbers per album
- `users.email UNIQUE`: Enforces one account per email

## Error Handling Patterns

### Global Error Handler
Fastify `setErrorHandler` catches all unhandled errors across the API.

### Validation Errors (Zod)
- Return 400 status with structured error details
- Frontend displays user-friendly toast notifications

### Database Constraint Violations
- Caught and converted to meaningful messages
- Example: "Email already registered" instead of "unique constraint violation"

### Worker Error Recovery
- Errors logged with full context (job ID, retry count, error message)
- No worker crashes (all async operations wrapped in try-catch)
- Failed jobs tracked in `upload_jobs.error_log`

## Monitoring & Observability

### Structured Logging
All critical operations log:
- Request IDs for tracing
- User context (ID, email, role)
- Performance metrics (response time)
- Error details with stack traces

### Job Status Tracking
`upload_jobs` table provides full audit trail:
- Creation time (`created_at`)
- Last update (`updated_at`)
- Retry count
- Error logs
- Final status

### Health Checks
`/health` endpoint reports:
- Server status
- Database connectivity
- Timestamp

## Future Enhancements

### Potential Improvements
1. **Redis-backed rate limiting** for distributed deployments
2. **Dead letter queue** for permanently failed upload jobs
3. **Automated cleanup** of old `COMPLETED` jobs
4. **Circuit breaker** for Supabase Storage API calls
5. **Metrics dashboard** for upload success rates and performance

## Summary

Vwaza Release Manager provides enterprise-grade resilience through:
- ✅ **Atomic transactions** for all upload operations
- ✅ **Orphaned file cleanup** prevents storage waste
- ✅ **Stuck job recovery** handles worker crashes
- ✅ **Retry logic** with exponential backoff
- ✅ **Rate limiting** prevents API abuse
- ✅ **Database indexes** optimize performance
- ✅ **Comprehensive logging** enables debugging

These mechanisms ensure **data consistency**, **fault tolerance**, and **operational reliability** across the entire platform.
