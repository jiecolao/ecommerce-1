// backend/src/integrations/steam/steam.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { SteamService } from './steam.service';

@Controller('steam')
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get(':id/info')
  async getGameInfo(@Param('id') id: string) {
    return this.steamService.getGameDetails(id);
  }

  @Get(':id/reviews')
  async getGameReviews(@Param('id') id: string){
    return this.steamService.getGameReviews(id);
  }
}