import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Get('products')
  getProducts(@Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.getProducts(adminId);
  }

  @Post('products')
  createProduct(@Body() dto: CreateAdminProductDto, @Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.createProduct(adminId, dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateAdminProductDto, @Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.updateProduct(parseInt(id, 10), adminId, dto);
  }

  @Post('products/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.uploadProductImage(parseInt(id, 10), adminId, file.originalname, file.buffer, file.mimetype);
  }


  @Delete('products/:id')
  deleteProduct(@Param('id') id: string, @Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.deleteProduct(parseInt(id, 10), adminId);
  }

  @Get('reports')
  getReports(@Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.getadminReport(adminId);
  }
}



