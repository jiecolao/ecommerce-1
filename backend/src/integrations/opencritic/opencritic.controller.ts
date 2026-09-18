import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { OpenCriticService } from './opencritic.service.spec';

@Controller('games')
export class OpenCriticController {
  constructor(private readonly openCriticService: OpenCriticService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return { message: 'Please provide a search query using the ?q= parameter' };
    }
    return this.openCriticService.searchGames(query);
  }

  @Get(':id')
  async getGame(@Param('id', ParseIntPipe) id: number) {
    return this.openCriticService.getGameDetails(id);
  }
}