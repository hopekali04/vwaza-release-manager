import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadAudioFileUseCase } from '@application/use-cases/UploadAudioFileUseCase.js';
import { UploadCoverArtUseCase } from '@application/use-cases/UploadCoverArtUseCase.js';
import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';
import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CloudStorageService } from '@infrastructure/storage/CloudStorageService.js';
import { Track } from '@domain/entities/Track.js';
import { Release } from '@domain/entities/Release.js';
import { ReleaseStatus, UploadJobType } from '@vwaza/shared';
import { PoolClient } from 'pg';

// Mock the database pool
vi.mock('@infrastructure/database/index.js', () => ({
  getDatabasePool: vi.fn(() => ({
    connect: vi.fn(() => Promise.resolve(mockClient)),
  })),
}));

const mockClient: Partial<PoolClient> = {
  query: vi.fn(),
  release: vi.fn(),
};

describe('Upload Use Cases', () => {
  let mockTrackRepository: ITrackRepository;
  let mockReleaseRepository: IReleaseRepository;
  let mockCloudStorage: CloudStorageService;

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

    // Create a mock object that matches the CloudStorageService interface/class structure
    mockCloudStorage = {
      uploadFile: vi.fn(),
      validateFileType: vi.fn(),
      validateFileSize: vi.fn(),
      deleteFile: vi.fn(),
    } as unknown as CloudStorageService;
  });

  describe('UploadAudioFileUseCase', () => {
    it('should successfully upload audio file', async () => {
      const trackId = 'track-123';
      const file = Buffer.from('fake-audio-data');
      const filename = 'track.mp3';

      const mockTrack: Track = {
        id: trackId,
        releaseId: 'release-123',
        title: 'Test Track',
        trackOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCloudStorage.validateFileType).mockReturnValue(true);
      vi.mocked(mockCloudStorage.validateFileSize).mockReturnValue(true);
      vi.mocked(mockTrackRepository.findById).mockResolvedValue(mockTrack);
      vi.mocked(mockCloudStorage.uploadFile).mockResolvedValue({
        url: 'https://example.com/audio/track.mp3',
        duration: 180,
      });
      vi.mocked(mockTrackRepository.update).mockResolvedValue(mockTrack);
      vi.mocked(mockClient.query).mockResolvedValue({} as any);

      const useCase = new UploadAudioFileUseCase(mockTrackRepository, mockCloudStorage);
      const result = await useCase.execute(trackId, file, filename);

      expect(mockCloudStorage.validateFileType).toHaveBeenCalledWith(filename, UploadJobType.AUDIO);
      expect(mockCloudStorage.uploadFile).toHaveBeenCalledWith(file, filename, UploadJobType.AUDIO);
      expect(result.url).toBe('https://example.com/audio/track.mp3');
    });
  });

  describe('UploadCoverArtUseCase', () => {
    it('should successfully upload cover art for DRAFT release', async () => {
      const releaseId = 'release-123';
      const file = Buffer.from('fake-image-data');
      const filename = 'cover.jpg';

      const mockRelease: Release = {
        id: releaseId,
        artistId: 'artist-123',
        title: 'Test Release',
        genre: 'Pop',
        status: ReleaseStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCloudStorage.validateFileType).mockReturnValue(true);
      vi.mocked(mockCloudStorage.validateFileSize).mockReturnValue(true);
      vi.mocked(mockReleaseRepository.findById).mockResolvedValue(mockRelease);
      vi.mocked(mockCloudStorage.uploadFile).mockResolvedValue({
        url: 'https://example.com/cover/cover.jpg',
      });
      vi.mocked(mockReleaseRepository.update).mockResolvedValue(mockRelease);
      vi.mocked(mockClient.query).mockResolvedValue({} as any);

      const useCase = new UploadCoverArtUseCase(mockReleaseRepository, mockCloudStorage);
      const result = await useCase.execute(releaseId, file, filename);

      expect(mockCloudStorage.validateFileType).toHaveBeenCalledWith(filename, UploadJobType.COVER_ART);
      expect(result).toBe('https://example.com/cover/cover.jpg');
    });
  });
});
