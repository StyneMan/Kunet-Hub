import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(3880, '0.0.0.0');
}
bootstrap();
