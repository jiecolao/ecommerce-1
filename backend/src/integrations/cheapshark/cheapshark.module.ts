import { Module } from '@nestjs/common';
import { CheapsharkService } from './cheapshark.service';
import { CheapsharkController } from './cheapshark.controller';

@Module({
  controllers: [CheapsharkController],
  providers: [CheapsharkService],
})
export class CheapsharkModule {}
