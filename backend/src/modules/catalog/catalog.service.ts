import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ListCatalogQueryDto } from './catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeaturedProducts() {
    return this.prisma.product.findMany({
      take: 12,
      include: { productVariants: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async listProducts(query: ListCatalogQueryDto) {
    const limit = query.limit ?? 20;

    return this.prisma.product.findMany({
      where: query.search
        ? {
            title: { contains: query.search, mode: 'insensitive' },
          }
        : undefined,
      take: limit,
      include: { productVariants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { seller: true, productVariants: true },
    });
  }
}
