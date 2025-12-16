import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateReleaseUseCase } from '@application/use-cases/CreateReleaseUseCase.js';
import { UpdateReleaseUseCase } from '@application/use-cases/UpdateReleaseUseCase.js';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { Release } from '@domain/entities/Release.js';
import { ReleaseStatus, CreateReleaseRequestDto, UpdateReleaseRequestDto } from '@vwaza/shared';

describe('Release Validation Logic', () => {
  let mockReleaseRepository: IReleaseRepository;

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
  });

  describe('CreateReleaseUseCase', () => {
    it('should create a release with valid data', async () => {
      const artistId = '123e4567-e89b-12d3-a456-426614174000';
      const request: CreateReleaseRequestDto = {
        title: 'Test Release',
        genre: 'Pop',
      };

      const createdRelease: Release = {
        id: 'release-123',
        artistId,
        title: request.title,
        genre: request.genre,
        status: ReleaseStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockReleaseRepository.create).mockResolvedValue(createdRelease);

      const useCase = new CreateReleaseUseCase(mockReleaseRepository);
      const result = await useCase.execute(artistId, request);

      expect(mockReleaseRepository.create).toHaveBeenCalledWith({
        artistId,
        title: request.title,
        genre: request.genre,
      });
      expect(result.id).toBe('release-123');
      expect(result.title).toBe('Test Release');
      expect(result.status).toBe(ReleaseStatus.DRAFT);
    });
  });

  describe('UpdateReleaseUseCase', () => {
    it('should update release with valid title', async () => {
      const releaseId = 'release-123';
      const request: UpdateReleaseRequestDto = {
        title: 'Updated Title',
      };

      const updatedRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: request.title!,
        genre: 'Pop',
        status: ReleaseStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockReleaseRepository.update).mockResolvedValue(updatedRelease);

      const useCase = new UpdateReleaseUseCase(mockReleaseRepository);
      const result = await useCase.execute(releaseId, request);

      expect(mockReleaseRepository.update).toHaveBeenCalledWith(releaseId, {
        title: 'Updated Title',
        genre: undefined,
        coverArtUrl: undefined,
      });
      expect(result?.title).toBe('Updated Title');
    });
  });
});
