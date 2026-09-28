import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IDENTITY_PROTO_PATH } from './grpc/proto-path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'identity',
        protoPath: IDENTITY_PROTO_PATH,
        url: process.env.GRPC_IDENTITY_URL || '0.0.0.0:50051',
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen();
  console.log('Identity grpc ....');
}
void bootstrap();
