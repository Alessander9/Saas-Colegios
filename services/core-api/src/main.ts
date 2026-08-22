import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ObservabilityInterceptor } from './shared/interceptors/observability.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { logger } from '@cole/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new ObservabilityInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Cole Educational SaaS Platform API')
    .setDescription('Multi-tenant Modular School Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'TenantId')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.info(`Core API service running on http://localhost:${port}/api/v1 (Docs at /docs)`);
}

bootstrap();
