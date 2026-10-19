import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { createCorsOptions } from '../src/config/http-security';
import { PRIVATE_API_PATHS, privateResponseCacheControl } from '../src/middleware/private-cache.middleware';
import { HttpErrorLogFilter } from '../src/filters/http-error-log.filter';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
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

    app.setGlobalPrefix('api');

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function (req: any, res: any) {
  const server = await bootstrap();
  server(req, res);
}
