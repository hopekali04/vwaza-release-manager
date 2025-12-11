import { z } from 'zod';
import { ReleaseStatus } from '../enums/index.js';

// Create release validation
export const createReleaseRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  genre: z.string().min(1, 'Genre is required').max(100, 'Genre is too long'),
});

// Update release validation
export const updateReleaseRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  genre: z.string().min(1, 'Genre is required').max(100, 'Genre is too long').optional(),
  coverArtUrl: z.string().url('Invalid cover art URL').optional(),
});

// Submit release validation
export const submitReleaseRequestSchema = z.object({
  releaseId: z.string().uuid('Invalid release ID'),
});

// Approve release validation
export const approveReleaseRequestSchema = z.object({
  releaseId: z.string().uuid('Invalid release ID'),
});

// Reject release validation
export const rejectReleaseRequestSchema = z.object({
  releaseId: z.string().uuid('Invalid release ID'),
  reason: z.string().optional(),
});

// Type inference
export type CreateReleaseRequestDto = z.infer<typeof createReleaseRequestSchema>;
export type UpdateReleaseRequestDto = z.infer<typeof updateReleaseRequestSchema>;
export type SubmitReleaseRequestDto = z.infer<typeof submitReleaseRequestSchema>;
export type ApproveReleaseRequestDto = z.infer<typeof approveReleaseRequestSchema>;
export type RejectReleaseRequestDto = z.infer<typeof rejectReleaseRequestSchema>;

// Response DTO (not validated, only for typing)
export interface ReleaseResponseDto {
  id: string;
  artistId: string;
  title: string;
  genre: string;
  coverArtUrl?: string;
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
}
