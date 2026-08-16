import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CreateSellerProductDto, UpdateSellerProductDto } from './seller.dto';
import { MockDB } from '../../integrations/prisma/mock-db';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService,
  ) {}

  async getProducts(sellerId: string) {
    if (!this.prisma.isReady()) {
      return MockDB.products.filter(p => p.sellerId === sellerId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return this.prisma.product.findMany({
      where: { sellerId },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(sellerId: string, dto: CreateSellerProductDto) {
    if (!this.prisma.isReady()) {
      const newProduct = {
        id: `mock-prod-${Date.now()}`,
        sellerId,
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
        sellerId,
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        inventoryCount: dto.inventoryCount,
        isFeatured: dto.isFeatured ?? false,
        status: dto.status ?? 'DRAFT',
      },
    });
  }

  async updateProduct(id: string, sellerId: string, dto: UpdateSellerProductDto) {
    if (!this.prisma.isReady()) {
      const index = MockDB.products.findIndex(p => p.id === id);
      if (index === -1) throw new NotFoundException('Product not found.');
      if (MockDB.products[index].sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');
      
      const updated = { ...MockDB.products[index], ...dto, updatedAt: new Date() };
      MockDB.products[index] = updated;
      return updated;
    }

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  async deleteProduct(id: string, sellerId: string) {
    if (!this.prisma.isReady()) {
      const index = MockDB.products.findIndex(p => p.id === id);
      if (index === -1) throw new NotFoundException('Product not found.');
      if (MockDB.products[index].sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');
      
      const [deleted] = MockDB.products.splice(index, 1);
      return deleted;
    }

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    return this.prisma.product.delete({ where: { id } });
  }

  async uploadProductImage(productId: string, sellerId: string, fileName: string, payload: string) {
    const upload = await this.blobService.uploadPlaceholderAsset(`products/${productId}/${fileName}`, payload);

    if (!this.prisma.isReady()) {
      const product = MockDB.products.find(p => p.id === productId);
      if (!product) throw new NotFoundException('Product not found.');
      if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

      const img = {
        id: `mock-img-${Date.now()}`,
        productId,
        blobUrl: upload.url,
        altText: fileName,
        createdAt: new Date(),
      };
      product.images = product.images || [];
      product.images.push(img);
      return img;
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.sellerId !== sellerId) throw new ForbiddenException('This product does not belong to the requesting seller.');

    return this.prisma.productImage.create({
      data: {
        productId,
        blobUrl: upload.url,
        altText: fileName,
      },
    });
  }

  async getSellerReport(sellerId: string) {
    if (!this.prisma.isReady()) {
      const products = MockDB.products.filter(p => p.sellerId === sellerId);
      
      let totalRevenueCents = 0;
      const topProductsMap = new Map();

      for (const product of products) {
        topProductsMap.set(product.id, {
          productId: product.id,
          title: product.title,
          quantitySold: 0,
          revenueCents: 0,
        });
      }

      const sellerProductIds = new Set(products.map(p => p.id));
      const sellerOrders = MockDB.orders.filter(o => o.items.some((i: any) => sellerProductIds.has(i.productId)));
      const totalOrders = sellerOrders.length;

      for (const order of MockDB.orders) {
        for (const item of order.items) {
          if (topProductsMap.has(item.productId)) {
            const entry = topProductsMap.get(item.productId);
            entry.quantitySold += item.quantity;
            entry.revenueCents += item.lineTotalCents;
            totalRevenueCents += item.lineTotalCents;
          }
        }
      }

      const topSellingProducts = Array.from(topProductsMap.values())
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 10);

      return {
        totalRevenueCents,
        totalOrders,
        topSellingProducts,
      };
    }

    const products = await this.prisma.product.findMany({
      where: { sellerId },
      include: { orderItems: { include: { order: true } } },
    });

    const uniqueOrderIds = new Set<string>();
    let totalRevenueCents = 0;

    const topSellingProducts = products
      .map((product) => {
        let quantitySold = 0;
        let revenueCents = 0;
        for (const item of product.orderItems) {
          quantitySold += item.quantity;
          revenueCents += item.lineTotalCents;
          uniqueOrderIds.add(item.orderId);
        }
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
      totalOrders: uniqueOrderIds.size,
      topSellingProducts,
    };
  }
}
