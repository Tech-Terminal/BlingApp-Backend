import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PublicApiModule } from './public-api.module';
import { AppConfig, GlobalExceptionFilter, validationExceptionFactory } from '@libs/index';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(PublicApiModule);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Allow class-validator to use NestJS Dependency Injection container for custom validators like IsUnique
  useContainer(app.select(PublicApiModule), { fallbackOnErrors: true });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Register global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = AppConfig.PUBLIC_PORT;

  await app.listen(port);
  console.log(`\x1b[34m🌍 Bling Public Consumer API running on: http://localhost:${port}/api\x1b[0m`);
}
bootstrap();
