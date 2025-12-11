import { z } from 'zod';

// Create track validation
export const createTrackRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  trackOrder: z.number().int().positive('Track order must be positive'),
  isrc: z.string().length(12, 'ISRC must be exactly 12 characters').optional(),
});

// Update track validation
export const updateTrackRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  trackOrder: z.number().int().positive('Track order must be positive').optional(),
  isrc: z.string().length(12, 'ISRC must be exactly 12 characters').optional(),
  durationSeconds: z.number().int().positive('Duration must be positive').optional(),
});

// Type inference
export type CreateTrackRequestDto = z.infer<typeof createTrackRequestSchema>;
export type UpdateTrackRequestDto = z.infer<typeof updateTrackRequestSchema>;

// Response DTO (not validated, only for typing)
export interface TrackResponseDto {
  id: string;
  releaseId: string;
  title: string;
  isrc?: string;
  audioFileUrl: string;
  durationSeconds: number;
  trackOrder: number;
  createdAt: string;
  updatedAt: string;
}
