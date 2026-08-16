import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateProductDto, ListCatalogQueryDto } from './catalog.dto';
import { MockDB } from '../../integrations/prisma/mock-db';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeaturedProducts() {
    if (!this.prisma.isReady()) {
      return MockDB.products.filter(p => p.isFeatured && p.status === 'PUBLISHED').slice(0, 12);
    }
    return this.prisma.product.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      include: { images: true },
      take: 12,
    });
  }

  async listProducts(query: ListCatalogQueryDto) {
    const limit = query.limit ?? 20;
    if (!this.prisma.isReady()) {
      let results = MockDB.products.filter(p => p.status === 'PUBLISHED');
      if (query.search) {
        results = results.filter(p => p.title.toLowerCase().includes(query.search!.toLowerCase()));
      }
      return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
    }

    return this.prisma.product.findMany({
      where: query.search
        ? {
            title: { contains: query.search, mode: 'insensitive' },
          }
        : undefined,
      take: limit,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    if (!this.prisma.isReady()) {
      return MockDB.products.find(p => p.id === id) || null;
    }
    return this.prisma.product.findUnique({
      where: { id },
      include: { images: true, seller: true },
    });
  }

  async createProduct(dto: CreateProductDto) {
    if (!this.prisma.isReady()) {
      const newProduct = {
        id: `mock-prod-${Date.now()}`,
        sellerId: 'demo-seller',
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        inventoryCount: dto.inventoryCount,
        isFeatured: dto.isFeatured ?? false,
        status: dto.status ?? 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
        images: []
      };
      MockDB.products.push(newProduct);
      return newProduct;
    }

    return this.prisma.product.create({
      data: {
        sellerId: 'demo-seller',
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        inventoryCount: dto.inventoryCount,
        isFeatured: dto.isFeatured ?? false,
        status: dto.status ?? 'DRAFT',
      },
    });
  }
}
