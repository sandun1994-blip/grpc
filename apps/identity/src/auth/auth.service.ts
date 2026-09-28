import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { RefreshSessionsRepository } from './refresh-sessions.repository';
import { TokensService } from './tokens.service';
import {
  AuthResponse,
  GetCurrentUserRequest,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  RefreshSessionRequest,
  UserPayload,
  UserResponse,
} from './interfaces/identity.interfaces';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshSessionsRepository: RefreshSessionsRepository,
    private readonly tokensService: TokensService,
  ) {}

  private toPayload(user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserPayload {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private async issueSession(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.tokensService.signAccessToken(userId);
    const refreshToken = this.tokensService.signRefreshToken(userId);
    const expiresAt = new Date(Date.now() + this.tokensService.refreshTtlMs);

    await this.refreshSessionsRepository.create({
      userId,
      tokenHash: this.tokensService.hashToken(refreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
 console.log({data});
 
    const existingEmail = await this.usersRepository.findByEmail(email);

    if (existingEmail) {
      throw new RpcException('EMAIL_TAKEN');
    }

    const existingUsername = await this.usersRepository.findByUsername(
      data.username,
    );

    if (existingUsername) {
      throw new RpcException('USERNAME_TAKEN');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    console.log({passwordHash});
    
    const user = await this.usersRepository.create({
      email,
      username: data.username,
      passwordHash,
    });

    const { accessToken, refreshToken } = await this.issueSession(user.id);

    return {
      user: this.toPayload(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new RpcException('INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new RpcException('INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = await this.issueSession(user.id);

    return {
      user: this.toPayload(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(data: RefreshSessionRequest): Promise<AuthResponse> {
    let payload: { sub: string };

    try {
      payload = this.tokensService.verifyRefreshToken(data.refreshToken);
    } catch (error) {
      throw new RpcException('INVALID_REFRESH_TOKEN');
    }

    const tokenHash = this.tokensService.hashToken(data.refreshToken);
    const session =
      await this.refreshSessionsRepository.findByTokenHash(tokenHash);

    if (!session || session.expiresAt < new Date()) {
      throw new RpcException('INVALID_REFRESH_TOKEN');
    }

    const user = await this.usersRepository.findById(session.userId);
    if (!user) {
      throw new RpcException('INVALID_REFRESH_TOKEN');
    }

    await this.refreshSessionsRepository.revoke(session.id);

    const { accessToken, refreshToken } = await this.issueSession(user.id);

    return {
      user: this.toPayload(user),
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(data: GetCurrentUserRequest): Promise<UserResponse> {
    const user = await this.usersRepository.findById(data.userId);

    if (!user) throw new RpcException('USER_NOT_FOUND');

    return { user: this.toPayload(user) };
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    const tokenHash = this.tokensService.hashToken(data.refreshToken);
    await this.refreshSessionsRepository.revokeByTokenHash(tokenHash);

    return {
      success: true,
    };
  }
}