import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';
import { CreateReleaseRequestDto, ReleaseResponseDto } from '@vwaza/shared';
import { ReleaseMapper } from '@application/mappers/ReleaseMapper.js';

export class CreateReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(artistId: string, request: CreateReleaseRequestDto): Promise<ReleaseResponseDto> {
    const release = await this.releaseRepository.create({
      artistId,
      title: request.title,
      genre: request.genre,
    });

    return ReleaseMapper.toDTO(release);
  }
}
