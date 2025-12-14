import { ITrackRepository } from '@domain/repositories/ITrackRepository.js';

export class DeleteTrackUseCase {
  constructor(private trackRepository: ITrackRepository) {}

  async execute(trackId: string): Promise<boolean> {
    return await this.trackRepository.delete(trackId);
  }
}
