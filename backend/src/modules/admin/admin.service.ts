import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService,
  ) {}

  async getMetadata() {
    const [stores, types, regions] = await Promise.all([
      this.prisma.store.findMany(),
      this.prisma.type.findMany(),
      this.prisma.region.findMany(),
    ]);
    return { stores, types, regions };
  }

  async getProducts(adminId: string) {
    return this.prisma.product.findMany({
      where: { adminId },
      include: { productVariants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(adminId: string, dto: CreateAdminProductDto, file: any) {
    // 1. Create product first to get the ID, but within a transaction?
    // Vercel Blob API doesn't support database transactions. 
    // We will upload the file first to a temporary path, then create the product.
    const tempId = Date.now().toString();
    const upload = await this.blobService.uploadImage(`products/tmp_${tempId}/${file.originalname}`, file.buffer, file.mimetype);

    try {
      const product = await this.prisma.product.create({
        data: {
          adminId,
          title: dto.title,
          description: dto.description,
          developer: dto.developer,
          publisher: dto.publisher,
          systemRequirements: dto.systemRequirements,
          tags: dto.tags ? dto.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          media: [upload.url],
          status: dto.status === 'ACTIVE' ? 'ACTIVE' : dto.status === 'INACTIVE' ? 'INACTIVE' : 'DRAFT',
          rating: dto.rating || null,
          productVariants: dto.variants ? {
            create: dto.variants.map(v => ({
              storeId: v.storeId,
              typeId: v.typeId,
              name: v.name,
              regionId: v.region,
              languageSupport: v.languageSupport,
              activationGuide: v.activationGuide || null,
              storePage: v.storePage,
              price: v.price,
              ...(v.keys && v.keys.length > 0 ? {
                keys: {
                  create: v.keys.map(code => ({ code }))
                }
              } : {})
            }))
          } : undefined
        },
      });

      // Audit Log
      await this.prisma.logs.create({
        data: {
          updatedBy: adminId,
          tableName: 'PRODUCT',
          recordId: product.id,
          updateAction: 'CREATE',
          updateDiff: { old: null, new: product }
        }
      });

      return product;
    } catch (e) {
      // If db fails, optionally delete the orphaned blob here
      throw e;
    }
  }

  async updateProduct(id: number, adminId: string, dto: UpdateAdminProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

    const { tags, status, rating, ...rest } = dto;
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        status: status ? (status === 'ACTIVE' ? 'ACTIVE' : status === 'INACTIVE' ? 'INACTIVE' : 'DRAFT') : undefined,
        rating: rating !== undefined ? rating : undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      },
    });

    // Audit Log
    await this.prisma.logs.create({
      data: {
        updatedBy: adminId,
        tableName: 'PRODUCT',
        recordId: product.id,
        updateAction: 'UPDATE',
        updateDiff: { old: product, new: updatedProduct }
      }
    });

    return updatedProduct;
  }

  async deleteProduct(id: number, adminId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

    await this.prisma.$transaction(async (prisma) => {
      await prisma.product.delete({ where: { id } });
    });

    // Audit Log
    await this.prisma.logs.create({
      data: {
        updatedBy: adminId,
        tableName: 'PRODUCT',
        recordId: product.id,
        updateAction: 'DELETE',
        updateDiff: { old: product, new: null }
      }
    });
    
    if (product.media && product.media.length > 0) {
      await this.blobService.deleteImages(product.media);
    }

    return product;
  }

  async uploadProductImage(productId: number, adminId: string, fileName: string, payload: Buffer, mimeType: string) {
    const upload = await this.blobService.uploadImage(`products/${productId}/${fileName}`, payload, mimeType);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.adminId !== adminId) throw new ForbiddenException('This product does not belong to the requesting admin.');

    // Append to media array
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        media: {
          push: upload.url
        }
      }
    });
  }

  async getadminReport(adminId: string) {
    const products = await this.prisma.product.findMany({
      where: { adminId },
      include: { orders: true },
    });

    let totalRevenueCents = 0;
    let totalOrders = 0;

    const topSellingProducts = products
      .map((product) => {
        let quantitySold = product.orders.length; // 1 order = 1 product in this schema
        let revenueCents = product.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        
        totalOrders += quantitySold;
        totalRevenueCents += revenueCents;

        return {
          productId: product.id,
          title: product.title,
          quantitySold,
          revenueCents,
        };
      })
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 5);

    return {
      totalRevenueCents,
      totalOrders,
      topSellingProducts,
    };
  }

  async getLogs() {
    const logs = await this.prisma.logs.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    return logs.map(log => {
      let description = '';
      const diff = log.updateDiff as any;
      const action = log.updateAction;
      const tableName = log.tableName;

      if (action === 'CREATE') {
        const title = diff?.new?.title || 'Unknown Record';
        description = `Created ${tableName.toLowerCase()} "${title}" (ID: ${log.recordId})`;
      } else if (action === 'UPDATE') {
        const oldTitle = diff?.old?.title || 'Unknown Record';
        const newTitle = diff?.new?.title || oldTitle;
        const changes: string[] = [];
        
        if (diff?.old && diff?.new) {
          for (const key of Object.keys(diff.new)) {
            const oldValue = diff.old[key];
            const newValue = diff.new[key];
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
              changes.push(`changed ${key} from "${oldValue}" to "${newValue}"`);
            }
          }
        }
        
        description = `Updated ${tableName.toLowerCase()} "${newTitle}" (ID: ${log.recordId}): ${changes.join(', ') || 'no values changed'}`;
      } else if (action === 'DELETE') {
        const title = diff?.old?.title || 'Unknown Record';
        description = `Deleted ${tableName.toLowerCase()} "${title}" (ID: ${log.recordId})`;
      }

      return {
        ...log,
        description,
      };
    });
  }
}
