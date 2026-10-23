import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { BlobService } from '../../integrations/blob/blob.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import {
  cleanProductMedia,
  FEATURED_PRODUCT_TAG,
  getFeaturedImageIndex,
  markFeaturedImage,
} from '../catalog/catalog.constants';

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

  async getProducts(_adminId: string) {
    const products = await this.prisma.product.findMany({
      include: {
        productVariants: {
          include: { _count: { select: { keys: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(product => this.toAdminProduct(product));
  }

  async getProduct(id: number, _adminId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productVariants: {
          include: { _count: { select: { keys: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return this.toAdminProduct(product);
  }

  private toAdminProduct<T extends { tags?: string[]; media?: string[] }>(product: T) {
    const productTags = product.tags ?? [];
    const media = product.media ?? [];
    return {
      ...product,
      isFeatured: productTags.includes(FEATURED_PRODUCT_TAG),
      ...(media.length > 0 ? { featuredImageIndex: getFeaturedImageIndex(media) } : {}),
      ...(product.media ? { media: cleanProductMedia(media) } : {}),
      tags: productTags.filter(tag => tag !== FEATURED_PRODUCT_TAG),
    };
  }

  private parseProductTags(tags?: string) {
    if (!tags) return [];
    return [...new Set(tags.split(',').map(tag => tag.trim()).filter(tag => tag && tag !== FEATURED_PRODUCT_TAG))];
  }

  private orderProductMedia(retainedMedia: string[], uploadedUrls: string[], imageOrder?: string[]) {
    if (imageOrder === undefined) return [...retainedMedia, ...uploadedUrls];
    if (imageOrder.length !== retainedMedia.length + uploadedUrls.length) {
      throw new BadRequestException('The product image order is invalid.');
    }

    const retained = new Set(retainedMedia);
    const usedExisting = new Set<string>();
    const usedUploads = new Set<number>();
    const ordered = imageOrder.map(token => {
      const uploadMatch = /^new:(\d+)$/.exec(token);
      if (uploadMatch) {
        const uploadIndex = Number(uploadMatch[1]);
        if (uploadIndex >= uploadedUrls.length || usedUploads.has(uploadIndex)) {
          throw new BadRequestException('The product image order is invalid.');
        }
        usedUploads.add(uploadIndex);
        return uploadedUrls[uploadIndex];
      }

      if (!retained.has(token) || usedExisting.has(token)) {
        throw new BadRequestException('The product image order is invalid.');
      }
      usedExisting.add(token);
      return token;
    });

    if (usedExisting.size !== retainedMedia.length || usedUploads.size !== uploadedUrls.length) {
      throw new BadRequestException('The product image order is invalid.');
    }
    return ordered;
  }

  private async clearOtherFeaturedProducts(prisma: Prisma.TransactionClient, exceptId?: number) {
    await prisma.$queryRaw<Array<{ lockResult: string }>>`
      SELECT pg_advisory_xact_lock(hashtext('mystikeys_featured_product'))::text AS "lockResult"
    `;
    const featuredProducts = await prisma.product.findMany({
      where: {
        tags: { has: FEATURED_PRODUCT_TAG },
        ...(exceptId === undefined ? {} : { id: { not: exceptId } }),
      },
      select: { id: true, tags: true },
    });

    await Promise.all(featuredProducts.map(product => prisma.product.update({
      where: { id: product.id },
      data: { tags: product.tags.filter(tag => tag !== FEATURED_PRODUCT_TAG) },
    })));
  }

  private safeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
  }

  private async uploadProductImages(prefix: string, files: any[], featuredUploadIndex = -1) {
    const urls: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const baseName = this.safeFileName(file.originalname || `image-${index + 1}.jpg`);
        const name = index === featuredUploadIndex && !baseName.startsWith('featured-')
          ? `featured-${baseName}`
          : baseName;
        const upload = await this.blobService.uploadImage(`${prefix}/${index + 1}-${name}`, file.buffer, file.mimetype);
        urls.push(upload.url);
      }
      return urls;
    } catch (error) {
      await this.blobService.deleteImages(urls).catch(() => undefined);
      throw error;
    }
  }

  async createProduct(adminId: string, dto: CreateAdminProductDto, files: any[]) {
    if (!files.length) throw new BadRequestException('Product must have at least one image.');
    if (files.length > 8) throw new BadRequestException('A product can have up to 8 images.');
    const status = dto.status === 'ACTIVE' ? 'ACTIVE' : dto.status === 'INACTIVE' ? 'INACTIVE' : 'DRAFT';
    if (dto.isFeatured && status !== 'ACTIVE') {
      throw new BadRequestException('Only an active product can be featured.');
    }
    const featuredImageIndex = dto.isFeatured ? (dto.featuredImageIndex ?? 0) : undefined;
    if (featuredImageIndex !== undefined && featuredImageIndex >= files.length) {
      throw new BadRequestException('The selected featured image is invalid.');
    }
    this.orderProductMedia([], files.map((_, index) => `pending-upload-${index}`), dto.imageOrder);

    const tempId = Date.now().toString();
    const selectedToken = featuredImageIndex === undefined ? undefined : dto.imageOrder?.[featuredImageIndex];
    const selectedUploadMatch = selectedToken ? /^new:(\d+)$/.exec(selectedToken) : null;
    const featuredUploadIndex = featuredImageIndex === undefined
      ? -1
      : selectedUploadMatch
        ? Number(selectedUploadMatch[1])
        : dto.imageOrder === undefined
          ? featuredImageIndex
          : -1;
    const uploadedUrls = await this.uploadProductImages(`products/tmp_${tempId}`, files, featuredUploadIndex);
    const orderedMedia = this.orderProductMedia([], uploadedUrls, dto.imageOrder);
    const storedMedia = markFeaturedImage(orderedMedia, featuredImageIndex);
    const tags = this.parseProductTags(dto.tags);
    if (dto.isFeatured) tags.push(FEATURED_PRODUCT_TAG);

    try {
      const createdProduct = await this.prisma.$transaction(async prisma => {
        if (dto.isFeatured) await this.clearOtherFeaturedProducts(prisma);
        const product = await prisma.product.create({
          data: {
            adminId,
            title: dto.title,
            description: dto.description,
            developer: dto.developer,
            publisher: dto.publisher,
            systemRequirements: dto.systemRequirements,
            tags,
            media: storedMedia,
            status,
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

        await prisma.logs.create({
          data: {
            updatedBy: adminId,
            tableName: 'PRODUCT',
            recordId: product.id,
            updateAction: 'CREATE',
            updateDiff: { old: null, new: product }
          }
        });
        return product;
      });
      return this.toAdminProduct(createdProduct);
    } catch (e) {
      await this.blobService.deleteImages(uploadedUrls).catch(() => undefined);
      throw e;
    }
  }

  async updateProduct(id: number, adminId: string, dto: UpdateAdminProductDto, files: any[] = []) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productVariants: true },
    });
    if (!product) throw new NotFoundException('Product not found.');

    const productMedia = cleanProductMedia(product.media);
    const retainedMedia = dto.media === undefined ? productMedia : [...new Set(dto.media)];
    if (retainedMedia.some(url => !productMedia.includes(url))) {
      throw new BadRequestException('Existing product images are invalid.');
    }
    if (retainedMedia.length + files.length === 0) {
      throw new BadRequestException('Product must have at least one image.');
    }
    if (retainedMedia.length + files.length > 8) {
      throw new BadRequestException('A product can have up to 8 images.');
    }

    const totalImages = retainedMedia.length + files.length;
    if (dto.featuredImageIndex !== undefined && dto.featuredImageIndex >= totalImages) {
      throw new BadRequestException('The selected featured image is invalid.');
    }
    this.orderProductMedia(retainedMedia, files.map((_, index) => `pending-upload-${index}`), dto.imageOrder);

    const currentIsFeatured = (product.tags ?? []).includes(FEATURED_PRODUCT_TAG);
    const currentFeaturedImage = productMedia[getFeaturedImageIndex(product.media)];
    const nextStatus = dto.status ?? product.status;
    if (dto.isFeatured && nextStatus !== 'ACTIVE') {
      throw new BadRequestException('Only an active product can be featured.');
    }
    const shouldFeature = nextStatus === 'ACTIVE' && (dto.isFeatured ?? currentIsFeatured);
    const visibleTags = dto.tags === undefined
      ? (product.tags ?? []).filter(tag => tag !== FEATURED_PRODUCT_TAG)
      : this.parseProductTags(dto.tags);
    const nextTags = shouldFeature ? [...visibleTags, FEATURED_PRODUCT_TAG] : visibleTags;

    const selectedToken = dto.featuredImageIndex === undefined ? undefined : dto.imageOrder?.[dto.featuredImageIndex];
    const selectedUploadMatch = selectedToken ? /^new:(\d+)$/.exec(selectedToken) : null;
    const featuredUploadIndex = shouldFeature && dto.featuredImageIndex !== undefined
      ? selectedUploadMatch
        ? Number(selectedUploadMatch[1])
        : dto.imageOrder === undefined && dto.featuredImageIndex >= retainedMedia.length
          ? dto.featuredImageIndex - retainedMedia.length
          : -1
      : -1;
    const uploadedUrls = await this.uploadProductImages(`products/${id}/${Date.now()}`, files, featuredUploadIndex);
    const orderedMedia = this.orderProductMedia(retainedMedia, uploadedUrls, dto.imageOrder);
    const preservedFeaturedIndex = currentFeaturedImage ? orderedMedia.indexOf(currentFeaturedImage) : -1;
    const nextFeaturedImageIndex = shouldFeature
      ? dto.featuredImageIndex ?? (preservedFeaturedIndex >= 0 ? preservedFeaturedIndex : 0)
      : undefined;
    const storedMedia = markFeaturedImage(orderedMedia, nextFeaturedImageIndex);
    const removedUrls = productMedia.filter(url => !retainedMedia.includes(url));
    const firstVariant = dto.variants?.[0];
    const existingVariant = product.productVariants[0];
    const variantData = firstVariant ? {
      storeId: firstVariant.storeId,
      typeId: firstVariant.typeId,
      name: firstVariant.name,
      regionId: firstVariant.region,
      languageSupport: firstVariant.languageSupport,
      activationGuide: firstVariant.activationGuide || null,
      storePage: firstVariant.storePage,
      price: firstVariant.price,
      ...(firstVariant.keys?.length ? {
        keys: { create: firstVariant.keys.map(code => ({ code })) },
      } : {}),
    } : undefined;

    const {
      tags: _tags,
      status,
      rating,
      media: _media,
      imageOrder: _imageOrder,
      variants: _variants,
      isFeatured: _isFeatured,
      featuredImageIndex: _featuredImageIndex,
      ...rest
    } = dto;
    try {
      const updatedProduct = await this.prisma.$transaction(async prisma => {
        if (shouldFeature) await this.clearOtherFeaturedProducts(prisma, id);
        const updated = await prisma.product.update({
          where: { id },
          data: {
            ...rest,
            media: storedMedia,
            status: status ? (status === 'ACTIVE' ? 'ACTIVE' : status === 'INACTIVE' ? 'INACTIVE' : 'DRAFT') : undefined,
            rating: rating !== undefined ? rating : undefined,
            tags: nextTags,
            productVariants: variantData
              ? existingVariant
                ? { update: { where: { id: existingVariant.id }, data: variantData } }
                : { create: variantData }
              : undefined,
          },
          include: { productVariants: true },
        });

        await prisma.logs.create({
          data: {
            updatedBy: adminId,
            tableName: 'PRODUCT',
            recordId: product.id,
            updateAction: 'UPDATE',
            updateDiff: { old: product, new: updated },
          },
        });
        return updated;
      });

      await this.blobService.deleteImages(removedUrls).catch(() => undefined);
      return this.toAdminProduct(updatedProduct);
    } catch (error) {
      await this.blobService.deleteImages(uploadedUrls).catch(() => undefined);
      throw error;
    }
  }

  async deleteProduct(id: number, adminId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');

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
      await this.blobService.deleteImages(cleanProductMedia(product.media));
    }

    return product;
  }

  async uploadProductImage(productId: number, _adminId: string, fileName: string, payload: Buffer, mimeType: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found.');

    const upload = await this.blobService.uploadImage(`products/${productId}/${fileName}`, payload, mimeType);

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
      include: {
        productVariants: {
          include: {
            orderLines: true
          }
        }
      },
    });

    let totalRevenueCents = 0;
    let totalOrders = 0;

    const topSellingProducts = products
      .map((product) => {
        let quantitySold = 0;
        let revenueCents = 0;

        for (const variant of product.productVariants) {
          for (const orderLine of variant.orderLines) {
            quantitySold += orderLine.quantity;
            revenueCents += orderLine.quantity * Number(orderLine.unitPrice);
          }
        }
        
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
