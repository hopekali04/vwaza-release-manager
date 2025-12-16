import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApproveReleaseUseCase } from '@application/use-cases/ApproveReleaseUseCase.js';
import { RejectReleaseUseCase } from '@application/use-cases/RejectReleaseUseCase.js';
import { SubmitReleaseUseCase } from '@application/use-cases/SubmitReleaseUseCase.js';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { Release } from '@domain/entities/Release.js';
import { Track } from '@domain/entities/Track.js';
import { ReleaseStatus } from '@vwaza/shared';
import { ResourceNotFoundError, InvalidStateError } from '@application/errors/ApplicationErrors.js';

describe('Release Status Transitions', () => {
  let mockReleaseRepository: IReleaseRepository;
  let mockTrackRepository: ITrackRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReleaseRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByArtistId: vi.fn(),
      findByStatus: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    mockTrackRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByReleaseId: vi.fn(),
      countByReleaseId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
  });

  describe('ApproveReleaseUseCase', () => {
    it('should approve a release in PENDING_REVIEW status', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.PENDING_REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const approvedRelease: Release = {
        ...mockRelease,
        status: ReleaseStatus.PUBLISHED,
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);
      vi.mocked(mockReleaseRepository.updateStatus).mockResolvedValue(approvedRelease);

      const useCase = new ApproveReleaseUseCase(mockReleaseRepository);
      const result = await useCase.execute(releaseId);

      expect(mockReleaseRepository.findById).toHaveBeenCalledWith(releaseId);
      expect(mockReleaseRepository.updateStatus).toHaveBeenCalledWith(
        releaseId,
        ReleaseStatus.PUBLISHED
      );
      expect(result.status).toBe(ReleaseStatus.PUBLISHED);
      expect(result.id).toBe(releaseId);
    });

    it('should throw ResourceNotFoundError when release does not exist', async () => {
      const releaseId = 'non-existent-id';
      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(null);

      const useCase = new ApproveReleaseUseCase(mockReleaseRepository);

      await expect(useCase.execute(releaseId)).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw InvalidStateError when release is in DRAFT status', async () => {
      const mockRelease: Release = {
        id: 'release-123',
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);

      const useCase = new ApproveReleaseUseCase(mockReleaseRepository);

      await expect(useCase.execute('release-123')).rejects.toThrow(InvalidStateError);
    });
  });

  describe('RejectReleaseUseCase', () => {
    it('should reject a release in PENDING_REVIEW status', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.PENDING_REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const rejectedRelease: Release = {
        ...mockRelease,
        status: ReleaseStatus.REJECTED,
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);
      vi.mocked(mockReleaseRepository.updateStatus).mockResolvedValue(rejectedRelease);

      const useCase = new RejectReleaseUseCase(mockReleaseRepository);
      const result = await useCase.execute(releaseId);

      expect(mockReleaseRepository.findById).toHaveBeenCalledWith(releaseId);
      expect(mockReleaseRepository.updateStatus).toHaveBeenCalledWith(
        releaseId,
        ReleaseStatus.REJECTED
      );
      expect(result.status).toBe(ReleaseStatus.REJECTED);
    });
  });

  describe('SubmitReleaseUseCase', () => {
    it('should successfully submit a valid DRAFT release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.DRAFT,
        coverArtUrl: 'https://example.com/cover.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTracks: Track[] = [
        {
          id: 'track-1',
          releaseId,
          title: 'Track 1',
          trackOrder: 1,
          audioFileUrl: 'https://example.com/track1.mp3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const processingRelease: Release = {
        ...mockRelease,
        status: ReleaseStatus.PROCESSING,
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);
      vi.mocked(mockTrackRepository.countByReleaseId).mockResolvedValue(1);
      vi.mocked(mockTrackRepository.findByReleaseId).mockResolvedValue(mockTracks);
      vi.mocked(mockReleaseRepository.updateStatus).mockResolvedValue(processingRelease);

      const useCase = new SubmitReleaseUseCase(mockReleaseRepository, mockTrackRepository);
      const result = await useCase.execute(releaseId);

      expect(result.status).toBe(ReleaseStatus.PROCESSING);
    });
  });
});
