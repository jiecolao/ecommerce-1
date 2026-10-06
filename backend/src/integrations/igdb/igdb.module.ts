import { Module } from '@nestjs/common';
import { IgdbService } from './igdb.service';
import { IgdbController } from './igdb.controller';

@Module({
  controllers: [IgdbController],
  providers: [IgdbService],
})
export class IgdbModule {}
