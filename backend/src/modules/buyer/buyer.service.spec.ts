import { Test, TestingModule } from '@nestjs/testing';
import { BuyerService } from './buyer.service';
import { PrismaService } from '../../integrations/prisma/prisma.service';

describe('BuyerService', () => {
  let service: BuyerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyerService,
        {
          provide: PrismaService,
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<BuyerService>(BuyerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
