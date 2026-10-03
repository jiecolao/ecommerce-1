// paymongo.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymongoService } from './paymongo.service';
import { PaymongoController } from './paymongo.controller';

@Module({
  // Import HttpModule for API requests and ConfigModule to read .env
  imports: [HttpModule], 
  controllers: [PaymongoController],
  providers: [PaymongoService],
})
export class PaymongoModule {}