import { Controller, Get, Param } from "@nestjs/common";
import { OpencriticService } from "./opencritic.service";

@Controller('opencritic')
export class OpencriticController {
  constructor(private readonly opencriticService: OpencriticService) {}
  
  @Get(':id/info')
  async getGameInfo(@Param('id') id: string){
    return this.opencriticService.getGameInfo(id);
  }

  @Get(':id/reviews')
  async getGameReviews(@Param('id') id: string){
    return this.opencriticService.getGameReviews(id);
  }
}