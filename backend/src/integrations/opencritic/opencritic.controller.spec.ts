import { Test, TestingModule } from '@nestjs/testing';
import { OpencriticController } from './opencritic.controller';
import { OpencriticService } from './opencritic.service';

describe('OpencriticController', () => {
  let controller: OpencriticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpencriticController],
      providers: [OpencriticService],
    }).compile();

    controller = module.get<OpencriticController>(OpencriticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
