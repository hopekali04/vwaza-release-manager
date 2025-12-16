import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTrackUseCase } from '@application/use-cases/CreateTrackUseCase.js';
import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { Track } from '@domain/entities/Track.js';
import { Release } from '@domain/entities/Release.js';
import { ReleaseStatus, CreateTrackRequestDto } from '@vwaza/shared';

describe('Track Validation and Business Logic', () => {
  let mockTrackRepository: ITrackRepository;
  let mockReleaseRepository: IReleaseRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTrackRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByReleaseId: vi.fn(),
      countByReleaseId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

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
  });

  describe('CreateTrackUseCase', () => {
    it('should create a track for a DRAFT release', async () => {
      const releaseId = 'release-123';
      const request: CreateTrackRequestDto = {
        title: 'Track Title',
        trackOrder: 1,
      };

      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdTrack: Track = {
        id: 'track-123',
        releaseId,
        title: request.title,
        trackOrder: request.trackOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);
      vi.mocked(mockTrackRepository.create).mockResolvedValue(createdTrack);

      const useCase = new CreateTrackUseCase(mockTrackRepository, mockReleaseRepository);
      const result = await useCase.execute(releaseId, request);

      expect(mockReleaseRepository.findById).toHaveBeenCalledWith(releaseId);
      expect(mockTrackRepository.create).toHaveBeenCalledWith({
        releaseId,
        title: request.title,
        trackOrder: request.trackOrder,
        isrc: undefined,
      });
      expect(result.title).toBe('Track Title');
    });

    it('should throw error when release is not in DRAFT status', async () => {
      const releaseId = 'release-123';
      const request: CreateTrackRequestDto = {
        title: 'Track Title',
        trackOrder: 1,
      };

      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);

      const useCase = new CreateTrackUseCase(mockTrackRepository, mockReleaseRepository);

      await expect(useCase.execute(releaseId, request)).rejects.toThrow(
        'Tracks can only be added to draft releases'
      );
    });
  });
});
