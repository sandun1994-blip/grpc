import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: { id: string };
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly jwtService: JwtService;

  constructor(private readonly config: ConfigService) {
    this.jwtService = new JwtService({
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    // "Bearer <token>" -> ["Bearer", "<token>"]
    const token = authHeader.split('Bearer ')[1];

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}