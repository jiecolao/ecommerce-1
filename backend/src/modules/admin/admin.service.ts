import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService,
  ) {}

  async getProducts(adminId: string) {
    return this.prisma.product.findMany({
      where: { adminId },
      include: { productVariants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(adminId: string, dto: CreateAdminProductDto) {
    return this.prisma.product.create({
      data: {
        adminId,
        title: dto.title,
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
            regionId: v.region,
            languageSupport: v.languageSupport,
            storePage: v.storePage,
            price: v.price,
            ...(v.keys && v.keys.length > 0 ? {
              keys: {
                create: v.keys.map(code => ({ code }))
              }
            } : {})
          }))
        } : undefined
      },
    });
  }

  async updateProduct(id: number, adminId: string, dto: UpdateAdminProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteProduct(id: number, adminId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

    await this.prisma.$transaction(async (prisma) => {
      await prisma.product.delete({ where: { id } });
    });
    
    if (product.media && product.media.length > 0) {
      await this.blobService.deleteImages(product.media);
    }

    return product;
  }

  async uploadProductImage(productId: number, adminId: string, fileName: string, payload: Buffer, mimeType: string) {
    const upload = await this.blobService.uploadImage(`products/${productId}/${fileName}`, payload, mimeType);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

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

  async getadminReport(adminId: string) {
    const products = await this.prisma.product.findMany({
      where: { adminId },
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



