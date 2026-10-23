import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AdminService } from '../src/modules/admin/admin.service';
import { BuyerService } from '../src/modules/buyer/buyer.service';
import { CatalogService } from '../src/modules/catalog/catalog.service';
import { FEATURED_IMAGE_MARKER, FEATURED_PRODUCT_TAG } from '../src/modules/catalog/catalog.constants';
import type { PrismaService } from '../src/integrations/prisma/prisma.service';
import type { BlobService } from '../src/integrations/blob/blob.service';

const adminId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

test('catalog keeps the arranged first image even when different artwork is featured', async () => {
  const database = {
    product: {
      async findMany() {
        return [{
          id: 6,
          title: 'Ordered art',
          media: [
            'https://example.invalid/card.jpg',
            `https://example.invalid/banner.jpg${FEATURED_IMAGE_MARKER}`,
          ],
          productVariants: [],
        }];
      },
    },
  };
  const service = new CatalogService(database as unknown as PrismaService);

  const result = await service.listProducts({});

  assert.deepEqual(result[0].media, [
    'https://example.invalid/card.jpg',
    'https://example.invalid/banner.jpg',
  ]);
});

test('buyer featured query returns only the explicitly featured active product', async () => {
  let query: any;
  const database = {
    product: {
      async findMany(args: any) {
        query = args;
        return [{
          id: 7,
          title: 'Featured game',
          tags: ['Action', FEATURED_PRODUCT_TAG],
          media: [
            'https://example.invalid/card.jpg',
            `https://example.invalid/banner.jpg${FEATURED_IMAGE_MARKER}`,
          ],
          productVariants: [{ price: 4999 }],
        }];
      },
    },
  };
  const service = new BuyerService(database as unknown as PrismaService, {} as BlobService);

  const result = await service.getFeaturedProducts();

  assert.deepEqual(query.where, { status: 'ACTIVE', tags: { has: FEATURED_PRODUCT_TAG } });
  assert.deepEqual(query.include, { productVariants: true });
  assert.equal(query.take, 1);
  assert.equal('tags' in result[0], false);
  assert.equal(result[0].featuredImage, 'https://example.invalid/banner.jpg');
  assert.deepEqual(result[0].media, [
    'https://example.invalid/card.jpg',
    'https://example.invalid/banner.jpg',
  ]);
});

test('admin can select one featured product and pin an existing image', async () => {
  const current = {
    id: 7,
    adminId,
    title: 'Selected game',
    status: 'ACTIVE',
    tags: ['Action'],
    media: ['https://example.invalid/one.jpg', 'https://example.invalid/two.jpg'],
    productVariants: [],
  };
  let lockCount = 0;
  let targetUpdate: any;
  let previousFeatureUpdate: any;
  const transaction = {
    async $queryRaw() { lockCount++; return []; },
    product: {
      async findMany() {
        return [{ id: 8, tags: ['RPG', FEATURED_PRODUCT_TAG] }];
      },
      async update(args: any) {
        if (args.where.id === current.id) {
          targetUpdate = args;
          return { ...current, ...args.data, productVariants: [] };
        }
        previousFeatureUpdate = args;
        return args.data;
      },
    },
    logs: { async create() {} },
  };
  const database = {
    product: { async findUnique() { return current; } },
    async $transaction(work: (client: typeof transaction) => Promise<unknown>) { return work(transaction); },
  };
  const blob = { async deleteImages() {} };
  const service = new AdminService(database as unknown as PrismaService, blob as unknown as BlobService);

  const result = await service.updateProduct(7, adminId, {
    media: current.media,
    isFeatured: true,
    featuredImageIndex: 1,
  });

  assert.equal(lockCount, 1);
  assert.deepEqual(previousFeatureUpdate.data.tags, ['RPG']);
  assert.deepEqual(targetUpdate.data.media, [
    current.media[0],
    `${current.media[1]}${FEATURED_IMAGE_MARKER}`,
  ]);
  assert.deepEqual(targetUpdate.data.tags, ['Action', FEATURED_PRODUCT_TAG]);
  assert.equal(result.isFeatured, true);
  assert.equal(result.featuredImageIndex, 1);
  assert.deepEqual(result.media, current.media);
  assert.deepEqual(result.tags, ['Action']);
});

test('a newly pinned upload receives a featured filename without replacing the normal first image', async () => {
  const uploadPaths: string[] = [];
  let createdData: any;
  const transaction = {
    async $queryRaw() { return []; },
    product: {
      async findMany() { return []; },
      async update() {},
      async create(args: any) {
        createdData = args.data;
        return { id: 9, ...args.data };
      },
    },
    logs: { async create() {} },
  };
  const database = {
    async $transaction(work: (client: typeof transaction) => Promise<unknown>) { return work(transaction); },
  };
  const blob = {
    async uploadImage(path: string) {
      uploadPaths.push(path);
      return { url: `https://example.invalid/${uploadPaths.length}.jpg` };
    },
    async deleteImages() {},
  };
  const service = new AdminService(database as unknown as PrismaService, blob as unknown as BlobService);

  await service.createProduct(adminId, {
    title: 'New feature',
    description: 'Synthetic product',
    status: 'ACTIVE',
    isFeatured: true,
    featuredImageIndex: 1,
  }, [
    { originalname: 'gallery.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('gallery') },
    { originalname: 'hero.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('hero') },
  ]);

  assert.match(uploadPaths[1], /featured-hero\.jpg$/);
  assert.deepEqual(createdData.media, [
    'https://example.invalid/1.jpg',
    `https://example.invalid/2.jpg${FEATURED_IMAGE_MARKER}`,
  ]);
  assert.ok(createdData.tags.includes(FEATURED_PRODUCT_TAG));
});

test('admin image ordering can interleave retained and newly uploaded artwork', async () => {
  const current = {
    id: 12,
    adminId,
    title: 'Ordered game',
    status: 'ACTIVE',
    tags: [],
    media: ['https://example.invalid/one.jpg', 'https://example.invalid/two.jpg'],
    productVariants: [],
  };
  let targetUpdate: any;
  const transaction = {
    async $queryRaw() { return [{ lockResult: '' }]; },
    product: {
      async findMany() { return []; },
      async update(args: any) {
        targetUpdate = args;
        return { ...current, ...args.data, productVariants: [] };
      },
    },
    logs: { async create() {} },
  };
  const database = {
    product: { async findUnique() { return current; } },
    async $transaction(work: (client: typeof transaction) => Promise<unknown>) { return work(transaction); },
  };
  const blob = {
    async uploadImage() { return { url: 'https://example.invalid/new.jpg' }; },
    async deleteImages() {},
  };
  const service = new AdminService(database as unknown as PrismaService, blob as unknown as BlobService);

  const result = await service.updateProduct(12, adminId, {
    media: current.media,
    imageOrder: [current.media[1], 'new:0', current.media[0]],
    isFeatured: true,
    featuredImageIndex: 1,
  }, [{ originalname: 'banner.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('banner') }]);

  assert.deepEqual(targetUpdate.data.media, [
    current.media[1],
    `https://example.invalid/new.jpg${FEATURED_IMAGE_MARKER}`,
    current.media[0],
  ]);
  assert.deepEqual(result.media, [
    current.media[1],
    'https://example.invalid/new.jpg',
    current.media[0],
  ]);
  assert.equal(result.featuredImageIndex, 1);
});

