import { Observable } from 'rxjs';

export interface UserPayload {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserPayload;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  user: UserPayload;
}

export interface LogoutResponse {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshSessionRequest {
  refreshToken: string;
}

export interface GetCurrentUserRequest {
  userId: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface IndentityServiceClient {
  register(data: RegisterRequest): Observable<AuthResponse>;
  login(data: LoginRequest): Observable<AuthResponse>;
  refreshSession(data: RefreshSessionRequest): Observable<AuthResponse>;
  getCurrentUser(data: GetCurrentUserRequest): Observable<UserResponse>;
  logout(data: LogoutRequest): Observable<LogoutResponse>;
}