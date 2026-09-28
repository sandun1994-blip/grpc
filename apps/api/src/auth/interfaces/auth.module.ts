import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_PROTO_PATH } from '../../grpc/proto-path';

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
        }}
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
