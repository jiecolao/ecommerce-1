import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminService } from './admin.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import type { AdminRequest } from '../auth/auth.types';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  private async validateMultipartDto<T extends object>(type: new () => T, payload: unknown) {
    const dto = plainToInstance(type, payload);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      throw new BadRequestException(errors.map(error => Object.values(error.constraints ?? {})).flat());
    }
    return dto;
  }

  private parseDataField(body: unknown) {
    const raw = typeof body === 'object' && body !== null && 'data' in body
      ? (body as { data?: unknown }).data
      : body;
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestException('Invalid JSON format for data field.');
    }
  }

  @Get('metadata')
  getMetadata() {
    return this.AdminService.getMetadata();
  }

  @Get('products')
  getProducts(@Req() req: AdminRequest) {
    const adminId = req.adminId;
    return this.AdminService.getProducts(adminId);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string, @Req() req: AdminRequest) {
    return this.AdminService.getProduct(parseInt(id, 10), req.adminId);
  }

  @Post('products')
  @UseInterceptors(FilesInterceptor('files', 8, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async createProduct(
    @Body() body: unknown,
    @UploadedFiles() files: any[],
    @Req() req: AdminRequest
  ) {
    if (!files?.length) throw new BadRequestException('Product must have at least one image.');
    if (files.some(file => !file.mimetype?.startsWith('image/'))) {
      throw new BadRequestException('Only image files can be uploaded.');
    }
    const parsed = this.parseDataField(body);
    if (!parsed) throw new BadRequestException('Product data is missing.');
    const dto = await this.validateMultipartDto(CreateAdminProductDto, parsed);

    const adminId = req.adminId;
    return this.AdminService.createProduct(adminId, dto, files);
  }

  @Patch('products/:id')
  @UseInterceptors(FilesInterceptor('files', 8, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async updateProduct(
    @Param('id') id: string,
    @Body() body: unknown,
    @UploadedFiles() files: any[],
    @Req() req: AdminRequest,
  ) {
    if (files?.some(file => !file.mimetype?.startsWith('image/'))) {
      throw new BadRequestException('Only image files can be uploaded.');
    }
    const dto = await this.validateMultipartDto(UpdateAdminProductDto, this.parseDataField(body));
    const adminId = req.adminId;
    return this.AdminService.updateProduct(parseInt(id, 10), adminId, dto, files ?? []);
  }

  @Post('products/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: AdminRequest
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const adminId = req.adminId;
    return this.AdminService.uploadProductImage(parseInt(id, 10), adminId, file.originalname, file.buffer, file.mimetype);
  }


  @Delete('products/:id')
  deleteProduct(@Param('id') id: string, @Req() req: AdminRequest) {
    const adminId = req.adminId;
    return this.AdminService.deleteProduct(parseInt(id, 10), adminId);
  }

  @Get('reports')
  getReports(@Req() req: AdminRequest) {
    const adminId = req.adminId;
    return this.AdminService.getadminReport(adminId);
  }

  @Get('logs')
  getLogs() {
    return this.AdminService.getLogs();
  }
}



