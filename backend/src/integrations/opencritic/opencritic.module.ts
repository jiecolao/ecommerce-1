import { Module } from '@nestjs/common';
import { OpencriticService } from './opencritic.service';
import { OpenCriticController } from './opencritic.controller';

@Module({
  controllers: [OpenCriticController],
  providers: [OpencriticService],
})
export class OpencriticModule {}
