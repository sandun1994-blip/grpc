import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

import { parseDurationToMs } from './utils/parse-duration';

type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

@Injectable()
export class TokensService {
  private readonly accessJwt: JwtService;
  private readonly refreshJwt: JwtService;
  readonly refreshTtlMs: number;

  constructor(private readonly config: ConfigService) {
    this.accessJwt = new JwtService({
      secret: this.config.get('JWT_ACCESS_SECRET'),
      signOptions: {
        expiresIn: this.config.get<string>(
          'JWT_ACCESS_EXPIRATION',
        ) as JwtExpiresIn,
      },
    });
    this.refreshJwt = new JwtService({
      secret: this.config.get('JWT_REFRESH_SECRET'),
      signOptions: {
        expiresIn: this.config.get<string>(
          'JWT_REFRESH_EXPIRATION',
        ) as JwtExpiresIn,
      },
    });
    this.refreshTtlMs = parseDurationToMs(
      this.config.get<string>('JWT_REFRESH_EXPIRATION') as JwtExpiresIn,
    );
  }

  signAccessToken(userId: string): string {
    return this.accessJwt.sign({ sub: userId });
  }

  signRefreshToken(userId: string): string {
    return this.refreshJwt.sign({ sub: userId });
  }

  verifyRefreshToken(token: string): { sub: string } {
    return this.refreshJwt.verify(token);
  }

  verifyAccessToken(token: string): { sub: string } {
    return this.accessJwt.verify(token);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
