import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerProductDto, UpdateSellerProductDto } from './seller.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('products')
  getProducts(@Req() req: any) {
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.getProducts(sellerId);
  }

  @Post('products')
  createProduct(@Body() dto: CreateSellerProductDto, @Req() req: any) {
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.createProduct(sellerId, dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateSellerProductDto, @Req() req: any) {
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.updateProduct(parseInt(id, 10), sellerId, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string, @Req() req: any) {
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.deleteProduct(parseInt(id, 10), sellerId);
  }

  @Get('reports')
  getReports(@Req() req: any) {
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.getSellerReport(sellerId);
  }
}
