import { ReleaseResponseDto } from '../schemas/release.schema.js';
import { ReleaseStatus } from '../enums/index.js';

export interface IErrorResponse {
  error: {
    message: string;
    statusCode: number;
    requestId?: string;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetReleasesParams {
  page?: number;
  limit?: number;
  status?: ReleaseStatus;
  artistId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedReleasesResponse {
  releases: Array<ReleaseResponseDto & { trackCount: number }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
