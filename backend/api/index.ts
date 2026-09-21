import 'reflect-metadata';
import { AppModule } from '../src/app.module';

// Dummy requires to ensure Vercel's Node File Trace (NFT) includes these dependencies
if (process.env.NODE_ENV === 'never') {
  require('@nestjs/core');
  require('@nestjs/common');
}

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    // Use dynamic import to prevent CommonJS transpilation from using require() on ESM modules
    const { NestFactory } = await eval(`import('@nestjs/core')`);
    const { ValidationPipe } = await eval(`import('@nestjs/common')`);
    
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: true,
      credentials: true,
    });

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
