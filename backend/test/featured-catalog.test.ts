import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AdminService } from '../src/modules/admin/admin.service';
import { BuyerService } from '../src/modules/buyer/buyer.service';
import { FEATURED_PRODUCT_TAG } from '../src/modules/catalog/catalog.constants';
import type { PrismaService } from '../src/integrations/prisma/prisma.service';
import type { BlobService } from '../src/integrations/blob/blob.service';

const adminId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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
          media: ['https://example.invalid/featured.jpg'],
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
  assert.deepEqual(targetUpdate.data.media, [current.media[1], current.media[0]]);
  assert.deepEqual(targetUpdate.data.tags, ['Action', FEATURED_PRODUCT_TAG]);
  assert.equal(result.isFeatured, true);
  assert.deepEqual(result.tags, ['Action']);
});

test('a newly pinned upload receives a featured filename and is stored first', async () => {
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
    'https://example.invalid/2.jpg',
    'https://example.invalid/1.jpg',
  ]);
  assert.ok(createdData.tags.includes(FEATURED_PRODUCT_TAG));
});

