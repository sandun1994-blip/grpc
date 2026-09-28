import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  AuthResponse,
  GetCurrentUserRequest,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  RefreshSessionRequest,
  RegisterRequest,
  UserResponse,
} from './interfaces/identity.interfaces';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('IdentityService', 'Register')
  register(data: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(data);
  }

  @GrpcMethod('IdentityService', 'Login')
  login(data: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(data);
  }

  @GrpcMethod('IdentityService', 'RefreshSession')
  refreshSession(data: RefreshSessionRequest): Promise<AuthResponse> {
    return this.authService.refreshSession(data);
  }

  @GrpcMethod('IdentityService', 'GetCurrentUser')
  getCurrentUser(data: GetCurrentUserRequest): Promise<UserResponse> {
    return this.authService.getCurrentUser(data);
  }

  @GrpcMethod('IdentityService', 'Logout')
  logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.authService.logout(data);
  }
}