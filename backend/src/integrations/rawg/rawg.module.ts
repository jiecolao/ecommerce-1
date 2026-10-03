import { Module } from '@nestjs/common';
import { RawgService } from './rawg.service';
import { RawgController } from './rawg.controller';

@Module({
  controllers: [RawgController],
  providers: [RawgService],
})
export class RawgModule {}
