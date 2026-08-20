import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('products/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.sellerService.uploadProductImage(parseInt(id, 10), sellerId, file.originalname, file.buffer, file.mimetype);
  }

  @Post('products/:id/image/base64')
  uploadImageBase64(
    @Param('id') id: string,
    @Body() body: { fileName: string, imageBase64: string },
    @Req() req: any
  ) {
    if (!body.imageBase64) throw new BadRequestException('No image data provided');
    
    // Extract mime type and base64 data
    const matches = body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException('Invalid base64 image data');
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const sellerId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    
    return this.sellerService.uploadProductImage(parseInt(id, 10), sellerId, body.fileName, buffer, mimeType);
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
