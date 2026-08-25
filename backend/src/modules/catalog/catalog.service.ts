import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ListCatalogQueryDto } from './dto/list-catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) { }

  async listProducts(query: ListCatalogQueryDto) {
    const limit = query.limit ?? 20;

    return this.prisma.product.findMany({
      where: query.search
        ? {
          title: { contains: query.search, mode: 'insensitive' },
        }
        : undefined,
      take: limit,
      select: { id: true, title: true, media: true, productVariants: { select: { price: true } } },
      orderBy: { title: 'desc' },
    });
  }

  async getProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { admin: true, productVariants: true },
    });
  }
}
