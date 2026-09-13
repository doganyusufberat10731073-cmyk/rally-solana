import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global API route prefix: /api/...
  app.setGlobalPrefix('api');

  // Configure CORS
  const corsOrigins = configService.get<string>('corsOrigin', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe for strict DTO checking
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rally API')
    .setDescription(
      'Production-ready REST API for Rally — Solana Team & Activity Coordination Platform.\n\n' +
      'Features:\n' +
      '- Solana wallet authentication (SIWS / Nonce challenge & Ed25519 signature verification)\n' +
      '- Activity discovery, filtering, creation, transaction-safe joins, and cancellation\n' +
      '- Reputation ledger, attendance verification, dynamic user stats\n' +
      '- Event notifications & user profiles',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token generated via /api/auth/verify',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Solana wallet signature challenge, verification, and session control')
    .addTag('Activities', 'Activity creation, discovery, filtering, joining, and management')
    .addTag('My Activities', 'User registered, hosted, and completed activities')
    .addTag('Users & Profile', 'User profiles, dynamic reputation metrics, and profile updates')
    .addTag('Notifications', 'User notification stream and status management')
    .addTag('Reputation', 'Reputation audit trail and point breakdown')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Rally API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  const port = configService.get<number>('port', 3001);
  await app.listen(port);
  logger.log(`Rally Backend is running on: http://localhost:${port}/api`);
  logger.log(`Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
