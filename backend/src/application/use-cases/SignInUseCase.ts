import { type SignInRequestDto, type AuthResponseDto } from '@vwaza/shared';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { comparePassword } from '@infrastructure/auth/password.js';
import { generateAccessToken } from '@infrastructure/auth/jwt.js';

export class SignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: SignInRequestDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

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
