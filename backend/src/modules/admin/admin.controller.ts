import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Get('metadata')
  getMetadata() {
    return this.AdminService.getMetadata();
  }

  @Get('products')
  getProducts(@Req() req: any) {
    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.getProducts(adminId);
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body('data') dataString: string,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('Product must have at least one image.');
    if (!dataString) throw new BadRequestException('Product data is missing.');
    
    // Import manually to avoid messing up top level imports for a quick fix
    const { plainToInstance } = require('class-transformer');
    const { validate } = require('class-validator');

    let parsed: any;
    try {
      parsed = JSON.parse(dataString);
    } catch {
      throw new BadRequestException('Invalid JSON format for data field.');
    }

    const dto = plainToInstance(CreateAdminProductDto, parsed);
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors.map((e: any) => Object.values(e.constraints)).flat());
    }

    const adminId = req.headers['x-actor-id'] ?? '22222222-2222-2222-2222-222222222222';
    return this.AdminService.createProduct(adminId, dto, file);
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

  @Get('logs')
  getLogs() {
    return this.AdminService.getLogs();
  }
}



