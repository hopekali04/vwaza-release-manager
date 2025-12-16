import { IReleaseRepository } from '@domain/repositories/IReleaseRepository.js';

export class DeleteReleaseUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(releaseId: string): Promise<boolean> {
    return await this.releaseRepository.delete(releaseId);
  }
}
