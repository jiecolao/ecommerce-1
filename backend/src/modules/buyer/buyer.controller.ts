import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './buyer.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Get('featured')
  getFeatured() {
    return this.buyerService.getFeaturedProducts();
  }

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? 'demo-buyer';
    return this.buyerService.checkout(buyerId, dto);
  }

  @Get('orders')
  getOrders(@Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? 'demo-buyer';
    return this.buyerService.getOrders(buyerId);
  }

  @Get('orders/:orderId/invoice')
  getOrderInvoice(@Param('orderId') orderId: string, @Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? 'demo-buyer';
    return this.buyerService.getInvoice(orderId, buyerId);
  }
}
