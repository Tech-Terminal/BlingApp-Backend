import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdminAppModule } from "./admin-app.module";
import { AppConfig, GlobalExceptionFilter, validationExceptionFactory } from "@libs/index";
import { useContainer } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AdminAppModule);
    
    // Set global API prefix
    app.setGlobalPrefix('api');
    
    // Enable CORS
    app.enableCors();
    
    // Allow class-validator to use NestJS Dependency Injection container
    useContainer(app.select(AdminAppModule), { fallbackOnErrors: true });

    // This turns on all validation across the entire app!
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strips out extra fields that aren't in the DTO
        transform: true, // Automatically transforms payloads to match DTO classes
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // Returns 422 instead of 400
        exceptionFactory: validationExceptionFactory
    }));

    // Register global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    const port = AppConfig.ADMIN_PORT;

    await app.listen(port);
    console.log(`\x1b[Bling Admin Dashboard API running on: http://localhost:${port}/api\x1b[0m`);
}
bootstrap();