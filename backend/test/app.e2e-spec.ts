import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('E-commerce API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/analytics/health (GET)', async () => {
    const response = await request.default(app.getHttpServer()).get('/analytics/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service');
  });

  it('/catalog/featured (GET)', async () => {
    const response = await request.default(app.getHttpServer()).get('/catalog/featured');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
