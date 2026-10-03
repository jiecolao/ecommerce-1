import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  // PROFILE
  @Get('featured')
  getFeatured() {
    return this.buyerService.getFeaturedProducts();
  }

  @Get('profile')
  getProfile(@Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getProfile(shopperId);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('profilePic'))
  updateProfile(
    @Req() req: any, 
    @Body() body: any,
    @UploadedFile() file?: any
  ) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.updateProfile(shopperId, body, file);
  }

  // CART
  @Get('cart')
  getCart(@Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getCart(shopperId);
  }

  @Post('cart/items')
  addToCart(@Body() dto: any, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.addToCart(shopperId, dto);
  }

  @Delete('cart/items/:lineId')
  removeFromCart(@Param('lineId') lineId: string, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.removeFromCart(shopperId, parseInt(lineId, 10));
  }

  // CHECKOUT
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.checkout(shopperId, dto);
  }

  @Get('orders')
  getOrders(@Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getOrders(shopperId);
  }

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getOrder(parseInt(orderId, 10), shopperId);
  }

  @Post('wishlist')
  addToWishlist(@Body('productVariantId') productVariantId: number, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.addToWishlist(shopperId, productVariantId);
  }

  @Delete('wishlist/:productVariantId')
  removeFromWishlist(@Param('productVariantId') productVariantId: string, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.removeFromWishlist(shopperId, parseInt(productVariantId, 10));
  }

  @Get('wishlist')
  getWishlist(@Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.getWishlist(shopperId);
  }
}
