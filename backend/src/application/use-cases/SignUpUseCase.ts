import { UserRole, type SignUpRequestDto, type AuthResponseDto } from '@vwaza/shared';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { hashPassword } from '@infrastructure/auth/password.js';
import { generateAccessToken } from '@infrastructure/auth/jwt.js';

export class SignUpUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: SignUpRequestDto): Promise<AuthResponseDto> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(request.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(request.password);

    // Create user
    const user = await this.userRepository.create({
      email: request.email,
      passwordHash,
      artistName: request.artistName,
      role: request.role || UserRole.ARTIST,
    });

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        artistName: user.artistName,
      },
    };
  }
}
