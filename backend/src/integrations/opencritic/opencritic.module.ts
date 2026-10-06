import { Module } from "@nestjs/common";
import { OpencriticService } from "./opencritic.service";
import { OpencriticController } from "./opencritic.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  controllers: [OpencriticController],
  providers: [OpencriticService],
  exports: [OpencriticService]
})

export class OpencriticModule {}