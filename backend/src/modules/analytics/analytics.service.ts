import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getHealthSummary() {
    return {
      service: 'e-commerce-platform',
      status: 'operational',
      architecture: 'NestJS + Prisma + Supabase + Vercel Blob',
      timestamp: new Date().toISOString(),
    };
  }
}
