import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unknown properties from DTOs
    }),
  );
  const port = app.get(ConfigService).get('PORT') || 3333;
  console.info(`Listening on port: ${port}`);
  await app.listen(port);
}
bootstrap();
