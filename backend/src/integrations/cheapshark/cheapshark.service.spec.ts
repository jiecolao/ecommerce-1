import { Test, TestingModule } from '@nestjs/testing';
import { CheapsharkService } from './cheapshark.service';

describe('CheapsharkService', () => {
  let service: CheapsharkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheapsharkService],
    }).compile();

    service = module.get<CheapsharkService>(CheapsharkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
