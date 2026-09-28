import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthResponse,
  IndentityServiceClient,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  UserResponse,
} from './interfaces/identity.interfaces';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private identityService!: IndentityServiceClient;

  constructor(
    @Inject('IDENTITY_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.identityService =
      this.client.getService<IndentityServiceClient>('IdentityService');
  }

  async register(dto: RegisterRequest): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.identityService.register(dto));
    } catch (error) {
      this.rethrowAsHttp(error);
    }
  }

  async login(dto: LoginRequest): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.identityService.login(dto));
    } catch (error) {
      this.rethrowAsHttp(error);
    }
  }

  async refresh(dto: RefreshDto): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.identityService.refreshSession(dto));
    } catch (error) {
      this.rethrowAsHttp(error);
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    try {
      return await firstValueFrom(
        this.identityService.getCurrentUser({ userId }),
      );
    } catch (error) {
      this.rethrowAsHttp(error);
    }
  }

  async logout(dto: LogoutRequest): Promise<LogoutResponse> {
    try {
      return await firstValueFrom(this.identityService.logout(dto));
    } catch (error) {
      this.rethrowAsHttp(error);
    }
  }

  private rethrowAsHttp(error: unknown): never {
    const message = error instanceof Error ? error.message : 'Unexpected Error';
    if (message.includes('EMAIL_TAKEN') || message.includes('USERNAME_TAKEN')) {
      throw new ConflictException(message);
    }
    if (message.includes('INVALID_CREDENTIALS')) {
      throw new UnauthorizedException(message);
    }
    if (message.includes('INVALID_REFRESH_TOKEN')) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (message.includes('USER_NOT_FOUND')) {
      throw new NotFoundException('User not found');
    }
    throw new InternalServerErrorException('Authentication service error');
  }
}