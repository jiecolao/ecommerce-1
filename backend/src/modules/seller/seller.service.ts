import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CreateSellerProductDto, UpdateSellerProductDto } from './seller.dto';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService,
  ) {}

  async getProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      include: { productVariants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(sellerId: string, dto: CreateSellerProductDto) {
    return this.prisma.product.create({
      data: {
        sellerId,
        title: dto.title,
        type: dto.type,
        description: dto.description,
        developer: dto.developer,
        publisher: dto.publisher,
        systemRequirements: dto.systemRequirements,
        tags: dto.tags,
        media: dto.media ?? [],
        productVariants: dto.variants ? {
          create: dto.variants.map(v => ({
            storeId: v.storeId,
            typeId: v.typeId,
            name: v.name,
            region: v.region,
            languageSupport: v.languageSupport,
            storePage: v.storePage,
            price: v.price
          }))
        } : undefined
      },
    });
  }

  async updateProduct(id: number, sellerId: string, dto: UpdateSellerProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteProduct(id: number, sellerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    return this.prisma.product.delete({ where: { id } });
  }

  async uploadProductImage(productId: number, sellerId: string, fileName: string, payload: Buffer, mimeType: string) {
    const upload = await this.blobService.uploadImage(`products/${productId}/${fileName}`, payload, mimeType);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    // Append to media array
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        media: {
          push: upload.url
        }
      }
    });
  }

  async getSellerReport(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      include: { orders: true },
    });

    let totalRevenueCents = 0;
    let totalOrders = 0;

    const topSellingProducts = products
      .map((product) => {
        let quantitySold = product.orders.length; // 1 order = 1 product in this schema
        let revenueCents = product.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        totalOrders += quantitySold;
        totalRevenueCents += revenueCents;

        return {
          productId: product.id,
          title: product.title,
          quantitySold,
          revenueCents,
        };
      })
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 10);

    return {
      totalRevenueCents,
      totalOrders,
      topSellingProducts,
    };
  }
}
