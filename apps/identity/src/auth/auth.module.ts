import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { RefreshSessionsRepository } from './refresh-sessions.repository';
import { TokensService } from './tokens.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    RefreshSessionsRepository,
    TokensService,
  ],
})
export class AuthModule {}
