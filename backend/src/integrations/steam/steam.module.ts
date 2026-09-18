// backend/src/integrations/steam/steam.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SteamService } from './steam.service';
import { SteamController } from './steam.controller';

@Module({
  imports: [HttpModule], // Required to use HttpService
  controllers: [SteamController],
  providers: [SteamService],
  exports: [SteamService], // Export it so other modules (like Catalog) can use it
})
export class SteamModule {}