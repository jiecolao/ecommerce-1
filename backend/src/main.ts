import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import session from 'express-session';
import { createCorsOptions, requireSteamSessionSecret } from './config/http-security';
import { PRIVATE_API_PATHS, privateResponseCacheControl } from './middleware/private-cache.middleware';
import { HttpErrorLogFilter } from './filters/http-error-log.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpErrorLogFilter(app.getHttpAdapter()));
  app.use(PRIVATE_API_PATHS, privateResponseCacheControl);
  app.enableCors(createCorsOptions());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    session({
      secret: requireSteamSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`E-commerce NestJS API running on http://localhost:${port}`);
}

bootstrap();
