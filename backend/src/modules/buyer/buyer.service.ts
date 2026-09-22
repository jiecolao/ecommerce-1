import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class BuyerService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeaturedProducts() {
    return this.prisma.product.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async checkout(buyerId: string, dto: CheckoutDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new BadRequestException(`Product ${dto.productId} is unavailable.`);
    }

    let discountAmount = 0;
    let amountPaid = dto.totalAmount;

    if (dto.discountCode) {
      if (dto.discountCode.toUpperCase() === 'SAVE10') {
        discountAmount = Math.round(dto.totalAmount * 0.1); // 10% discount
        amountPaid = dto.totalAmount - discountAmount;
      } else {
        throw new BadRequestException('Invalid discount code.');
      }
    }

    const order = await this.prisma.order.create({
      data: {
        customerId: buyerId,
        productId: dto.productId,
        totalAmount: dto.totalAmount,
        discountCode: dto.discountCode ? dto.discountCode.toUpperCase() : null,
        discountAmount: discountAmount,
        amountPaid: amountPaid,
        status: 'COMPLETED',
      },
    });

    return { order };
  }

  async getOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { customerId: buyerId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(orderId: number, buyerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.customerId !== buyerId) {
      throw new BadRequestException('This order does not belong to the requesting buyer.');
    }

    return order;
  }

  async addToWishlist(customerId: string, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const existing = await this.prisma.wishlist.findFirst({
      where: { customerId, productId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.wishlist.create({
      data: { customerId, productId },
    });
  }

  async removeFromWishlist(customerId: string, productId: number) {
    await this.prisma.wishlist.deleteMany({
      where: { customerId, productId },
    });
    return { success: true };
  }

  async getWishlist(customerId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            productVariants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return wishlists.map(w => w.product);
  }
}
