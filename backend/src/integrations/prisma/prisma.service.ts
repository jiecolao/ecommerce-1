import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private ready = false;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL is not configured. Prisma is running in fallback mode.');
      return;
    }

    try {
      await this.$connect();
      this.ready = true;
    } catch (error) {
      this.logger.warn(
        `Prisma connection unavailable. Falling back to safe placeholder mode: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.ready = false;
    }
  }

  async onModuleDestroy() {
    if (this.ready) {
      await this.$disconnect();
    }
  }

  isReady() {
    return this.ready;
  }

  async withFallback<T>(fallback: T, executor: () => Promise<T>): Promise<T> {
    if (!this.ready) {
      return fallback;
    }

    try {
      return await executor();
    } catch (error) {
      this.logger.warn(
        `Prisma query failed; returning fallback data: ${error instanceof Error ? error.message : String(error)}`,
      );
      return fallback;
    }
  }
}
