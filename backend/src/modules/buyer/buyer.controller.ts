import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './dto/checkout.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ShopperGuard } from '../auth/guards/shopper.guard';
import type { ShopperRequest } from '../auth/auth.types';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  // PROFILE
  @Get('featured')
  getFeatured() {
    return this.buyerService.getFeaturedProducts();
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  getProfile(@Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.getProfile(shopperId);
  }

  @Put('profile')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  @UseInterceptors(FileInterceptor('profilePic', { limits: { fileSize: 5 * 1024 * 1024 } }))
  updateProfile(
    @Req() req: ShopperRequest,
    @Body() body: any,
    @UploadedFile() file?: any
  ) {
    const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (file && !allowedImageTypes.has(file.mimetype)) {
      throw new BadRequestException('Profile picture must be a PNG, JPG, or WEBP image.');
    }
    const shopperId = req.shopperId;
    return this.buyerService.updateProfile(shopperId, body, file);
  }

  // CART
  @Get('cart')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  getCart(@Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.getCart(shopperId);
  }

  @Post('cart/items')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  addToCart(@Body() dto: any, @Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.addToCart(shopperId, dto);
  }

  @Delete('cart/items/:lineId')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  removeFromCart(@Param('lineId') lineId: string, @Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.removeFromCart(shopperId, parseInt(lineId, 10));
  }

  // CHECKOUT
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const shopperId = req.headers['x-actor-id'] ?? '11111111-1111-1111-1111-111111111111';
    return this.buyerService.checkout(shopperId, dto);
  }

  @Get('orders')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  getOrders(@Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.getOrders(shopperId);
  }

  @Get('orders/:orderId')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  getOrder(@Param('orderId') orderId: string, @Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.getOrder(parseInt(orderId, 10), shopperId);
  }

  @Post('wishlist')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  addToWishlist(@Body('productVariantId') productVariantId: number, @Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.addToWishlist(shopperId, productVariantId);
  }

  @Delete('wishlist/:productVariantId')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  removeFromWishlist(@Param('productVariantId') productVariantId: string, @Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.removeFromWishlist(shopperId, parseInt(productVariantId, 10));
  }

  @Get('wishlist')
  @UseGuards(SupabaseAuthGuard, ShopperGuard)
  getWishlist(@Req() req: ShopperRequest) {
    const shopperId = req.shopperId;
    return this.buyerService.getWishlist(shopperId);
  }
}
