import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../../integrations/prisma/prisma.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;

  // 1. Define a mock for the PrismaService methods you use
  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // 2. Inject the mock
        }
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listProducts', () => {
    it('should call prisma.product.findMany with default limit when no query provided', async () => {
      // 3. Mock the expected resolved value from Prisma
      const mockProducts = [{ id: 1, title: 'Game' }];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.listProducts({});

      // 4. Assert the result matches our mock
      expect(result).toEqual(mockProducts);

      // 5. Assert that Prisma was called with the exact expected arguments
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: undefined,
        take: 20, // Our default limit
        include: { productVariants: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should call prisma.product.findMany with search filter and custom limit', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.listProducts({ search: 'Mario', limit: 10 });

      expect(result).toEqual([]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: 'Mario', mode: 'insensitive' },
        },
        take: 10,
        include: { productVariants: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
