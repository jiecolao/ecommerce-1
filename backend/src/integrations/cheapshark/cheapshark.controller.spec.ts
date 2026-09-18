import { Test, TestingModule } from '@nestjs/testing';
import { CheapsharkController } from './cheapshark.controller';
import { CheapsharkService } from './cheapshark.service';

describe('CheapsharkController', () => {
  let controller: CheapsharkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheapsharkController],
      providers: [CheapsharkService],
    }).compile();

    controller = module.get<CheapsharkController>(CheapsharkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
