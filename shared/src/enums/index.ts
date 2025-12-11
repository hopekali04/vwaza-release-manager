export enum UserRole {
  ARTIST = 'ARTIST',
  ADMIN = 'ADMIN',
}

export enum ReleaseStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export enum UploadJobStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum UploadJobType {
  AUDIO = 'AUDIO',
  COVER_ART = 'COVER_ART',
}
