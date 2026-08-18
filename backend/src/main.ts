import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  for (const name of [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ]) {
    if (!process.env[name]) throw new Error(`${name} must be configured`);
  }
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((origin) =>
    origin.trim(),
  ) ?? ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception formatting
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Mini Marketplace API')
    .setDescription('Документація для бекенду маркетплейсу')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Бекенд успішно запущено на: http://localhost:${port}`);
  logger.log(
    `Swagger документація доступна за адресою: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
