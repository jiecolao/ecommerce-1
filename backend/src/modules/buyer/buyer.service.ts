import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class BuyerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService
  ) {}

  async getProfile(shopperId: string) {
    const shopper = await this.prisma.shopper.findUnique({
      where: { id: shopperId },
    });
    if (!shopper) throw new NotFoundException('Shopper not found');
    return shopper;
  }

  async updateProfile(shopperId: string, body: any, file?: any) {
    const shopper = await this.prisma.shopper.findUnique({
      where: { id: shopperId },
    });
    if (!shopper) throw new NotFoundException('Shopper not found');

    const updateData: any = {
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
    };

    if (file) {
      if (shopper.profilePic && !shopper.profilePic.includes('example.com') && !shopper.profilePic.includes('placeholder.local')) {
        await this.blobService.deleteImages([shopper.profilePic]).catch(() => {});
      }
      const ext = file.originalname.split('.').pop() || 'jpg';
      const path = `avatars/${shopperId}-${Date.now()}.${ext}`;
      const upload = await this.blobService.uploadImage(path, file.buffer, file.mimetype);
      updateData.profilePic = upload.url;
    }

    return this.prisma.shopper.update({
      where: { id: shopperId },
      data: updateData,
    });
  }

  async getCart(shopperId: string) {
    let cart = await this.prisma.order.findFirst({
      where: { shopperId, status: 'CART' },
      include: { orderLines: { include: { productVariant: { include: { product: true } } } } },
    });

    if (!cart) {
      cart = await this.prisma.order.create({
        data: {
          shopperId,
          status: 'CART',
          totalAmount: 0,
        },
        include: { orderLines: { include: { productVariant: { include: { product: true } } } } },
      });
    }

    return cart;
  }

  async addToCart(shopperId: string, dto: any) {
    const cart = await this.getCart(shopperId);
    
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.productVariantId },
    });
    
    if (!variant) throw new BadRequestException('Product Variant not found');

    const existingLine = cart.orderLines.find(line => line.productVariantId === dto.productVariantId);

    if (existingLine) {
      await this.prisma.orderLine.update({
        where: { id: existingLine.id },
        data: { quantity: existingLine.quantity + (dto.quantity || 1) }
      });
    } else {
      await this.prisma.orderLine.create({
        data: {
          orderId: cart.id,
          productVariantId: dto.productVariantId,
          quantity: dto.quantity || 1,
          unitPrice: variant.price,
          targetAccount: dto.targetAccount,
          deliveredTo: dto.deliveredTo,
        }
      });
    }

    return this.getCart(shopperId);
  }

  async removeFromCart(shopperId: string, lineId: number) {
    const cart = await this.getCart(shopperId);
    const line = cart.orderLines.find(l => l.id === lineId);
    
    if (!line) throw new NotFoundException('Item not in cart');

    await this.prisma.orderLine.delete({
      where: { id: lineId }
    });

    return this.getCart(shopperId);
  }

  async getFeaturedProducts() {
    return this.prisma.product.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async checkout(buyerId: string, dto: CheckoutDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.productId },
      include: { product: true },
    });

    if (!variant) {
      throw new BadRequestException(`Product Variant ${dto.productId} is unavailable.`);
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
        shopperId: buyerId,
        totalAmount: dto.totalAmount,
        discountCode: dto.discountCode ? dto.discountCode.toUpperCase() : null,
        discountAmount: discountAmount,
        amountPaid: amountPaid,
        status: 'COMPLETED',
        orderLines: {
          create: [{
            productVariantId: dto.productId,
            unitPrice: variant.price,
            quantity: 1,
          }]
        }
      },
      include: { orderLines: true }
    });

    return { order };
  }

  async getOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { shopperId: buyerId },
      include: { orderLines: { include: { productVariant: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(orderId: number, buyerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderLines: { include: { productVariant: { include: { product: true } } } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.shopperId !== buyerId) {
      throw new BadRequestException('This order does not belong to the requesting buyer.');
    }

    return order;
  }

  async addToWishlist(shopperId: string, productVariantId: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });
    if (!variant) {
      throw new NotFoundException('Product Variant not found.');
    }

    const existing = await this.prisma.wishlist.findFirst({
      where: { shopperId, productVariantId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.wishlist.create({
      data: { shopperId, productVariantId },
    });
  }

  async removeFromWishlist(shopperId: string, productVariantId: number) {
    await this.prisma.wishlist.deleteMany({
      where: { shopperId, productVariantId },
    });
    return { success: true };
  }

  async getWishlist(shopperId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { shopperId },
      include: {
        productVariant: {
          include: {
            product: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return wishlists.map(w => w.productVariant);
  }
}
