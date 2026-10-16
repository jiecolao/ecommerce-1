// paymongo.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymongoService } from './paymongo.service';
import { PaymongoController } from './paymongo.controller';

@Module({
  imports: [HttpModule], 
  controllers: [PaymongoController],
  providers: [PaymongoService],
  exports: [PaymongoService]
})
export class PaymongoModule {}