// backend/src/integrations/steam/steam.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SteamService } from './steam.service';
import { SteamController } from './steam.controller';

@Module({
  imports: [HttpModule], 
  controllers: [SteamController],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}