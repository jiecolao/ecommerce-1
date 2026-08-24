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

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        productId: dto.productId,
        totalAmount: dto.totalAmount,
        status: 'PAID',
      },
    });

    return { order };
  }

  async getOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
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

    if (order.buyerId !== buyerId) {
      throw new BadRequestException('This order does not belong to the requesting buyer.');
    }

    return order;
  }
}
