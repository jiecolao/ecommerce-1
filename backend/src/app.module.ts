import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './integrations/prisma/prisma.module';
import { SupabaseModule } from './integrations/supabase/supabase.module';
import { BlobModule } from './integrations/blob/blob.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { BuyerModule } from './modules/buyer/buyer.module';
import { SellerModule } from './modules/seller/seller.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    SupabaseModule,
    BlobModule,
    CatalogModule,
    BuyerModule,
    SellerModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
