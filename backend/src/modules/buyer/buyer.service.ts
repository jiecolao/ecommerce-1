import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CheckoutDto } from './buyer.dto';
import { MockDB } from '../../integrations/prisma/mock-db';

@Injectable()
export class BuyerService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeaturedProducts() {
    if (!this.prisma.isReady()) {
      return MockDB.products.filter(p => p.isFeatured && p.status === 'PUBLISHED').sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    return this.prisma.product.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      include: { images: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async checkout(buyerId: string, dto: CheckoutDto) {
    if (!this.prisma.isReady()) {
      let subtotalCents = 0;
      const preparedItems = [];
      
      for (const item of dto.items) {
        const productIndex = MockDB.products.findIndex(p => p.id === item.productId && p.status === 'PUBLISHED');
        if (productIndex === -1) throw new BadRequestException(`Product ${item.productId} is unavailable.`);
        
        const product = MockDB.products[productIndex];
        if (product.inventoryCount < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.title}.`);
        
        const lineTotal = product.priceCents * item.quantity;
        subtotalCents += lineTotal;
        
        // Decrement stock in MockDB immediately
        MockDB.products[productIndex].inventoryCount -= item.quantity;
        
        preparedItems.push({
          id: `mock-item-${Date.now()}-${Math.random()}`,
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
          lineTotalCents: lineTotal,
          product: product, // include for frontend rendering convenience
        });
      }

      const shippingCents = Math.round(subtotalCents * 0.08);
      const totalCents = subtotalCents + shippingCents;
      
      const orderId = `mock-order-${Date.now()}`;
      
      const order = {
        id: orderId,
        buyerId,
        status: 'PAID',
        subtotalCents,
        shippingCents,
        totalCents,
        paymentReference: `ASSUMED-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: preparedItems,
      };
      
      const invoice = {
        id: `mock-invoice-${Date.now()}`,
        orderId,
        invoiceNo: `INV-${orderId.slice(0, 8).toUpperCase()}`,
        billingName: dto.billingName,
        billingEmail: dto.billingEmail,
        notes: dto.notes ?? 'Placeholder payment assumed successful.',
        issuedAt: new Date(),
      };

      MockDB.orders.push(order);
      MockDB.invoices.push(invoice);

      return { order, invoice };
    }

    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'PUBLISHED' },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotalCents = 0;
    const preparedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} is unavailable.`);
      }
      if (product.inventoryCount < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.title}.`);
      }

      const lineTotal = product.priceCents * item.quantity;
      subtotalCents += lineTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents: lineTotal,
      };
    });

    const shippingCents = Math.round(subtotalCents * 0.08);
    const totalCents = subtotalCents + shippingCents;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId,
          status: 'PAID',
          subtotalCents,
          shippingCents,
          totalCents,
          paymentReference: `ASSUMED-${Date.now()}`,
          items: {
            create: preparedItems,
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of preparedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inventoryCount: { decrement: item.quantity } },
        });
      }

      const invoice = await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNo: `INV-${order.id.slice(0, 8).toUpperCase()}`,
          billingName: dto.billingName,
          billingEmail: dto.billingEmail,
          notes: dto.notes ?? 'Placeholder payment assumed successful.',
        },
      });

      return {
        order,
        invoice,
      };
    });
  }

  async getOrders(buyerId: string) {
    if (!this.prisma.isReady()) {
      return MockDB.orders.filter(o => o.buyerId === buyerId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { items: { include: { product: true } }, invoice: true }, // Add product include so it matches frontend needs
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoice(orderId: string, buyerId: string) {
    if (!this.prisma.isReady()) {
      const order = MockDB.orders.find(o => o.id === orderId);
      if (!order) throw new NotFoundException('Order not found.');
      if (order.buyerId !== buyerId) throw new BadRequestException('This order does not belong to the requesting buyer.');
      
      const invoice = MockDB.invoices.find(i => i.orderId === orderId);
      if (!invoice) throw new NotFoundException('Invoice not generated.');
      
      return { ...order, invoice };
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.buyerId !== buyerId) {
      throw new BadRequestException('This order does not belong to the requesting buyer.');
    }

    if (!order.invoice) {
      throw new NotFoundException('Invoice not generated.');
    }

    return order;
  }
}
