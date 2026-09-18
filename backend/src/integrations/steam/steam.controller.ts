// backend/src/integrations/steam/steam.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { SteamService } from './steam.service';

@Controller('steam') // This sets the base route to /steam
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get(':id') // This catches requests like /steam/570
  async getGameInfo(@Param('id') id: string) {
    // Passes the ID (e.g., '570') to your service and returns the data
    return this.steamService.getGameDetails(id);
  }

  @Get(':id/reviews')
  async getGameReviews(@Param('id') id: string){
    return this.steamService.getGameReviews(id);
  }
}