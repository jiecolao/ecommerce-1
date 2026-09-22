import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Get('featured')
  getFeatured() {
    return this.buyerService.getFeaturedProducts();
  }

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.checkout(buyerId, dto);
  }

  @Get('orders')
  getOrders(@Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getOrders(buyerId);
  }

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string, @Req() req: any) {
    const buyerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getOrder(parseInt(orderId, 10), buyerId);
  }

  @Post('wishlist')
  addToWishlist(@Body('productId') productId: number, @Req() req: any) {
    const customerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.addToWishlist(customerId, productId);
  }

  @Delete('wishlist/:productId')
  removeFromWishlist(@Param('productId') productId: string, @Req() req: any) {
    const customerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.removeFromWishlist(customerId, parseInt(productId, 10));
  }

  @Get('wishlist')
  getWishlist(@Req() req: any) {
    const customerId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getWishlist(customerId);
  }
}
