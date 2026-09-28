import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IDENTITY_PROTO_PATH } from '../grpc/proto-path';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IDENTITY_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'identity',
          protoPath: IDENTITY_PROTO_PATH,
          url: process.env.GRPC_IDENTITY_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService,AccessTokenGuard],
})
export class AuthModule {}
