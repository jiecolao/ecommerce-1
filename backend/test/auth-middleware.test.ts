import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { Module, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AuthService } from '../src/modules/auth/auth.service';
import { SupabaseAuthGuard } from '../src/modules/auth/guards/supabase-auth.guard';
import { ShopperGuard } from '../src/modules/auth/guards/shopper.guard';
import { AdminGuard } from '../src/modules/auth/guards/admin.guard';
import { BuyerController } from '../src/modules/buyer/buyer.controller';
import { BuyerService } from '../src/modules/buyer/buyer.service';
import { AdminController } from '../src/modules/admin/admin.controller';
import { AdminService } from '../src/modules/admin/admin.service';
import { PrismaService } from '../src/integrations/prisma/prisma.service';
import { BlobService } from '../src/integrations/blob/blob.service';

// All identities, tokens, records and adapters in this file are synthetic.
// The HTTP app below has no real Prisma, Supabase or Blob provider.
const buyerA = '11111111-1111-4111-8111-111111111111';
const buyerB = '22222222-2222-4222-8222-222222222222';
const adminA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const adminB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const orphan = '33333333-3333-4333-8333-333333333333';
const unavailable = '44444444-4444-4444-8444-444444444444';
const tokens: Record<string, string> = {
  'header.buyer-a.signature': buyerA,
  'header.buyer-b.signature': buyerB,
  'header.admin-a.signature': adminA,
  'header.admin-b.signature': adminB,
  'header.orphan.signature': orphan,
  'header.unavailable.signature': unavailable,
};

function serviceWithUserResponse(getUser: (token?: string) => Promise<unknown>): AuthService {
  const service = new AuthService({} as PrismaService, new ConfigService({
    SUPABASE_URL: 'https://audit.example.invalid',
    SUPABASE_PUBLISHABLE_KEY: 'synthetic-key-not-used',
  }));
  Reflect.set(service, 'supabase', { auth: { getUser } });
  return service;
}

test('verification uses each explicit token and returns only the verified subject', async () => {
  const seen: Array<string | undefined> = [];
  const service = serviceWithUserResponse(async token => {
    seen.push(token);
    return { data: { user: {
      id: token === 'first' ? buyerA : buyerB,
      email: 'synthetic@example.invalid',
      app_metadata: { role: 'admin' },
      user_metadata: { role: 'admin' },
    } }, error: null };
  });
  assert.deepEqual(await service.verifyAccessToken('first'), { id: buyerA });
  assert.deepEqual(await service.verifyAccessToken('second'), { id: buyerB });
  assert.deepEqual(seen, ['first', 'second']);
});

test('invalid or expired provider tokens produce a redacted 401', async () => {
  const service = serviceWithUserResponse(async () => ({
    data: { user: null },
    error: { name: 'AuthApiError', status: 401, message: 'private-provider-detail' },
  }));
  await assert.rejects(service.verifyAccessToken('expired'), error => {
    assert.ok(error instanceof UnauthorizedException);
    assert.equal(error.getStatus(), 401);
    assert.ok(!error.message.includes('private-provider-detail'));
    return true;
  });
});

test('upstream auth failures fail closed as redacted 503 responses', async () => {
  for (const providerError of [
    { name: 'AuthRetryableFetchError', status: 0 },
    { name: 'AuthApiError', status: 503 },
  ]) {
    const service = serviceWithUserResponse(async () => ({ data: { user: null }, error: providerError }));
    await assert.rejects(service.verifyAccessToken('token'), ServiceUnavailableException);
  }
  const service = serviceWithUserResponse(async () => { throw new Error('private-provider-detail'); });
  await assert.rejects(service.verifyAccessToken('token'), error => {
    assert.ok(error instanceof ServiceUnavailableException);
    assert.ok(!error.message.includes('private-provider-detail'));
    return true;
  });
});

test('a missing or invalid verified subject is never used as a fallback identity', async () => {
  for (const user of [null, { id: 'not-a-uuid' }]) {
    const service = serviceWithUserResponse(async () => ({ data: { user }, error: null }));
    await assert.rejects(service.verifyAccessToken('token'), UnauthorizedException);
  }
});

const calls: Array<{ name: string; id?: string }> = [];
const authCalls: string[] = [];
const membershipReads: string[] = [];
const prisma = {
  shopper: {
    async findUnique({ where }: { where: { id: string } }) {
      membershipReads.push(where.id);
      if (where.id === unavailable) throw new Error('private-database-detail');
      return [buyerA, buyerB].includes(where.id) ? { id: where.id } : null;
    },
  },
  admin: {
    async findUnique({ where }: { where: { id: string } }) {
      membershipReads.push(where.id);
      if (where.id === unavailable) throw new Error('private-database-detail');
      return [adminA, adminB].includes(where.id) ? { id: where.id } : null;
    },
  },
  order: {
    async findUnique({ where }: { where: { id: number } }) {
      return where.id === 7 ? { id: 7, shopperId: buyerA, orderLines: [] } : null;
    },
  },
};
const ownershipService = new BuyerService(prisma as unknown as PrismaService, {} as BlobService);
const buyers = {
  getFeaturedProducts() { return []; },
  getProfile(id: string) { calls.push({ name: 'profile', id }); return { id }; },
  updateProfile(id: string) { calls.push({ name: 'profile-update', id }); return { id }; },
  getCart(id: string) { calls.push({ name: 'cart', id }); return { shopperId: id, status: 'CART', orderLines: [] }; },
  addToCart(id: string) { calls.push({ name: 'cart-add', id }); return { shopperId: id }; },
  removeFromCart(id: string) { calls.push({ name: 'cart-remove', id }); return { shopperId: id }; },
  getOrders(id: string) { calls.push({ name: 'orders', id }); return []; },
  getOrder(orderId: number, id: string) { calls.push({ name: 'order', id }); return ownershipService.getOrder(orderId, id); },
  addToWishlist(id: string) { calls.push({ name: 'wishlist-add', id }); return { shopperId: id }; },
  removeFromWishlist(id: string) { calls.push({ name: 'wishlist-remove', id }); return { shopperId: id }; },
  getWishlist(id: string) { calls.push({ name: 'wishlist', id }); return []; },
};
const admins = {
  getMetadata() { calls.push({ name: 'metadata' }); return { stores: [], regions: [], types: [] }; },
  getProducts(id: string) { calls.push({ name: 'products', id }); return [{ adminId: id }]; },
  getProduct(productId: number, id: string) { calls.push({ name: `product-${productId}`, id }); return { id: productId, adminId: id }; },
  getadminReport(id: string) { calls.push({ name: 'reports', id }); return { adminId: id }; },
  getLogs() { calls.push({ name: 'logs' }); return []; },
};
const auth = {
  async verifyAccessToken(token: string) {
    authCalls.push(token);
    if (token === 'header.network.signature') throw new ServiceUnavailableException('Authentication service is unavailable.');
    const id = tokens[token];
    if (!id) throw new UnauthorizedException('Invalid or expired access token.');
    return { id };
  },
};

@Module({
  controllers: [BuyerController, AdminController],
  providers: [
    SupabaseAuthGuard, ShopperGuard, AdminGuard,
    { provide: BuyerService, useValue: buyers },
    { provide: AdminService, useValue: admins },
    { provide: AuthService, useValue: auth },
    { provide: PrismaService, useValue: prisma },
  ],
})
class AuthTestModule {}

let app: INestApplication;
let baseUrl: string;
before(async () => {
  app = await NestFactory.create(AuthTestModule, { logger: false });
  app.setGlobalPrefix('api');
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api`;
});
after(async () => { await app?.close(); });

async function request(path: string, token?: string, method = 'GET', extraHeaders: Record<string, string> = {}) {
  const headers = { ...extraHeaders, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(baseUrl + path, { method, headers });
  return { status: response.status, body: await response.json() };
}

const protectedRoutes = [
  ['GET', '/buyer/profile'], ['PUT', '/buyer/profile'], ['GET', '/buyer/cart'],
  ['POST', '/buyer/cart/items'], ['DELETE', '/buyer/cart/items/7'], ['GET', '/buyer/orders'],
  ['GET', '/buyer/orders/7'], ['POST', '/buyer/wishlist'], ['DELETE', '/buyer/wishlist/7'], ['GET', '/buyer/wishlist'],
  ['GET', '/admin/metadata'], ['GET', '/admin/products'], ['GET', '/admin/products/7'], ['POST', '/admin/products'],
  ['PATCH', '/admin/products/7'], ['POST', '/admin/products/7/image'], ['DELETE', '/admin/products/7'],
  ['GET', '/admin/reports'], ['GET', '/admin/logs'],
];

test('all private buyer and admin handlers reject anonymous calls before membership or business work', async () => {
  const start = calls.length;
  const reads = membershipReads.length;
  for (const [method, path] of protectedRoutes) {
    const result = await request(path, undefined, method, { 'x-actor-id': adminA });
    assert.equal(result.status, 401, `${method} ${path}`);
  }
  assert.equal(calls.length, start);
  assert.equal(membershipReads.length, reads);
});

test('malformed authorization never reaches the identity provider', async () => {
  const start = authCalls.length;
  for (const authorization of ['Basic a.b.c', 'Bearer', 'Bearer fake-token', 'Bearer a.b.c extra', 'Bearer a.b.c, Bearer d.e.f']) {
    const response = await fetch(baseUrl + '/buyer/profile', { headers: { Authorization: authorization } });
    assert.equal(response.status, 401);
    await response.arrayBuffer();
  }
  assert.equal(authCalls.length, start);
});

test('provider-rejected tokens fail before membership or business work', async () => {
  const start = calls.length;
  const reads = membershipReads.length;
  const result = await request('/buyer/profile', 'header.expired.signature');
  assert.equal(result.status, 401);
  assert.equal(calls.length, start);
  assert.equal(membershipReads.length, reads);
});

test('a verified buyer gets only their own profile despite a forged actor ID', async () => {
  const result = await request('/buyer/profile', 'header.buyer-a.signature', 'GET', { 'x-actor-id': buyerB });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { id: buyerA });
});

test('saved cart and wishlist use the verified buyer identity', async () => {
  const cart = await request('/buyer/cart', 'header.buyer-a.signature', 'GET', { 'x-actor-id': buyerB });
  assert.equal(cart.status, 200);
  assert.equal(cart.body.shopperId, buyerA);
  const wishlist = await request('/buyer/wishlist', 'header.buyer-a.signature');
  assert.equal(wishlist.status, 200);
});

test('a second buyer cannot read another buyer order even with its owner header', async () => {
  const own = await request('/buyer/orders/7', 'header.buyer-a.signature');
  assert.equal(own.status, 200);
  const other = await request('/buyer/orders/7', 'header.buyer-b.signature', 'GET', { 'x-actor-id': buyerA });
  assert.equal(other.status, 400); // Preserve the existing ownership error contract.
  assert.equal(other.body.shopperId, undefined);
});

test('a verified account with no existing shopper record is denied without provisioning', async () => {
  assert.equal((await request('/buyer/profile', 'header.orphan.signature')).status, 403);
});

test('buyers cannot gain admin access using actor or role headers', async () => {
  for (const path of ['/admin/metadata', '/admin/products', '/admin/reports', '/admin/logs']) {
    const result = await request(path, 'header.buyer-a.signature', 'GET', { 'x-actor-id': adminA, 'x-role': 'admin' });
    assert.equal(result.status, 403, path);
  }
});

test('existing admin membership authorizes the verified admin ID rather than the actor header', async () => {
  const result = await request('/admin/products', 'header.admin-a.signature', 'GET', { 'x-actor-id': adminB });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, [{ adminId: adminA }]);
});

test('identity and membership outages fail closed without leaking provider details', async () => {
  assert.equal((await request('/buyer/profile', 'header.network.signature')).status, 503);
  for (const path of ['/buyer/profile', '/admin/logs']) {
    const result = await request(path, 'header.unavailable.signature');
    assert.equal(result.status, 503);
    assert.ok(!JSON.stringify(result.body).includes('private-database-detail'));
  }
});

test('public featured listing remains accessible without authentication', async () => {
  const result = await request('/buyer/featured');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

test('store admins can upload to any existing product, while missing products fail before Blob upload', async () => {
  let uploads = 0;
  let writes = 0;
  const db = { product: {
    async findUnique({ where }: { where: { id: number } }) { return where.id === 7 ? { id: 7, adminId: adminA } : null; },
    async update() { writes++; },
  } };
  const blob = { async uploadImage() { uploads++; return { url: 'https://example.invalid/audit.png' }; } };
  const service = new AdminService(db as unknown as PrismaService, blob as unknown as BlobService);
  await service.uploadProductImage(7, adminB, 'audit.png', Buffer.from('synthetic'), 'image/png');
  await assert.rejects(service.uploadProductImage(8, adminA, 'audit.png', Buffer.from('synthetic'), 'image/png'), { status: 404 });
  assert.equal(uploads, 1);
  assert.equal(writes, 1);
});

test('admin product listing fetches the complete store catalog without creator filtering', async () => {
  let findManyArgs: any;
  const expected = [{ id: 7, title: 'Store-wide product' }];
  const db = { product: {
    async findMany(args: any) {
      findManyArgs = args;
      return expected;
    },
  } };
  const service = new AdminService(db as unknown as PrismaService, {} as BlobService);

  const result = await service.getProducts(adminB);

  assert.deepEqual(result, [{ ...expected[0], isFeatured: false, tags: [] }]);
  assert.equal(findManyArgs.where, undefined);
  assert.deepEqual(findManyArgs.orderBy, { createdAt: 'desc' });
});

test('an authorized image upload retains the existing append behavior', async () => {
  const steps: string[] = [];
  const db = { product: {
    async findUnique() { steps.push('read'); return { id: 7, adminId: adminA }; },
    async update(args: unknown) { steps.push('update'); return args; },
  } };
  const blob = { async uploadImage() { steps.push('upload'); return { url: 'https://example.invalid/audit.png' }; } };
  const service = new AdminService(db as unknown as PrismaService, blob as unknown as BlobService);
  const result = await service.uploadProductImage(7, adminA, 'audit.png', Buffer.from('synthetic'), 'image/png');
  assert.deepEqual(steps, ['read', 'upload', 'update']);
  assert.deepEqual(result, { where: { id: 7 }, data: { media: { push: 'https://example.invalid/audit.png' } } });
});

test('product creation persists every uploaded image', async () => {
  let createArgs: any;
  const tx = {
    product: {
      async create(args: any) {
        createArgs = args;
        return { id: 7, ...args.data };
      },
    },
    logs: { async create() {} },
  };
  const db = { async $transaction(work: (client: typeof tx) => Promise<unknown>) { return work(tx); } };
  let uploadNumber = 0;
  const blob = {
    async uploadImage() {
      uploadNumber++;
      return { url: `https://example.invalid/image-${uploadNumber}.jpg` };
    },
    async deleteImages() {},
  };
  const service = new AdminService(db as unknown as PrismaService, blob as unknown as BlobService);

  await service.createProduct(adminA, {
    title: 'Multi-image product',
    description: 'Synthetic product',
  }, [
    { originalname: 'cover.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('cover') },
    { originalname: 'gallery.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('gallery') },
  ]);

  assert.equal(uploadNumber, 2);
  assert.deepEqual(createArgs.data.media, [
    'https://example.invalid/image-1.jpg',
    'https://example.invalid/image-2.jpg',
  ]);
});

test('product editing retains selected images, appends uploads, and removes deleted blobs', async () => {
  const current = {
    id: 7,
    adminId: adminA,
    title: 'Old title',
    media: ['https://example.invalid/keep.jpg', 'https://example.invalid/remove.jpg'],
    productVariants: [{ id: 11 }],
  };
  let updateArgs: any;
  let logWrites = 0;
  const db = {
    product: { async findUnique() { return current; } },
    async $transaction(work: (tx: any) => Promise<unknown>) {
      return work({
        product: {
          async update(args: any) {
            updateArgs = args;
            return { ...current, ...args.data };
          },
        },
        logs: { async create() { logWrites++; } },
      });
    },
  };
  const deleted: string[][] = [];
  const blob = {
    async uploadImage() { return { url: 'https://example.invalid/new.jpg' }; },
    async deleteImages(urls: string[]) { deleted.push(urls); },
  };
  const service = new AdminService(db as unknown as PrismaService, blob as unknown as BlobService);

  const result = await service.updateProduct(7, adminA, {
    title: 'New title',
    media: ['https://example.invalid/keep.jpg'],
    tags: 'Action, RPG',
    variants: [{
      storeId: 1,
      typeId: 2,
      name: 'Standard Edition',
      region: 3,
      languageSupport: ['English'],
      price: 4999,
      keys: ['NEW-KEY'],
    }],
  }, [{ originalname: 'new image.png', mimetype: 'image/png', buffer: Buffer.from('image') }]);

  assert.equal(result.title, 'New title');
  assert.deepEqual(updateArgs.data.media, ['https://example.invalid/keep.jpg', 'https://example.invalid/new.jpg']);
  assert.deepEqual(updateArgs.data.tags, ['Action', 'RPG']);
  assert.deepEqual(updateArgs.data.productVariants.update.where, { id: 11 });
  assert.deepEqual(updateArgs.data.productVariants.update.data.keys, { create: [{ code: 'NEW-KEY' }] });
  assert.deepEqual(deleted, [['https://example.invalid/remove.jpg']]);
  assert.equal(logWrites, 1);
});

test('product editing rejects removal of every image before uploading or writing', async () => {
  let uploads = 0;
  let writes = 0;
  const db = {
    product: {
      async findUnique() {
        return { id: 7, adminId: adminA, media: ['https://example.invalid/only.jpg'], productVariants: [] };
      },
    },
    async $transaction() { writes++; },
  };
  const blob = { async uploadImage() { uploads++; }, async deleteImages() {} };
  const service = new AdminService(db as unknown as PrismaService, blob as unknown as BlobService);

  await assert.rejects(service.updateProduct(7, adminA, { media: [] }), { status: 400 });
  assert.equal(uploads, 0);
  assert.equal(writes, 0);
});

test('profile picture replacement stores the new URL before deleting the old blob', async () => {
  const steps: string[] = [];
  let updateArgs: any;
  const db = {
    shopper: {
      async findUnique() {
        steps.push('read');
        return { id: buyerA, profilePic: 'https://blob.example.invalid/old.jpg' };
      },
      async update(args: any) {
        steps.push('update');
        updateArgs = args;
        return { id: buyerA, ...args.data };
      },
    },
  };
  const blob = {
    async uploadImage() {
      steps.push('upload');
      return { url: 'https://blob.example.invalid/new.jpg' };
    },
    async deleteImages(urls: string[]) {
      steps.push(`delete:${urls.join(',')}`);
    },
  };
  const service = new BuyerService(db as unknown as PrismaService, blob as unknown as BlobService);

  const result = await service.updateProfile(buyerA, { firstName: 'Ada' }, {
    originalname: 'new avatar.png',
    mimetype: 'image/png',
    buffer: Buffer.from('image'),
  });

  assert.deepEqual(steps, ['read', 'upload', 'update', 'delete:https://blob.example.invalid/old.jpg']);
  assert.equal(updateArgs.data.profilePic, 'https://blob.example.invalid/new.jpg');
  assert.equal(result.profilePic, 'https://blob.example.invalid/new.jpg');
});

test('clearing a profile picture persists the initials fallback and removes the old blob', async () => {
  let updateArgs: any;
  const deleted: string[][] = [];
  const db = {
    shopper: {
      async findUnique() { return { id: buyerA, profilePic: 'https://blob.example.invalid/avatar.jpg' }; },
      async update(args: any) {
        updateArgs = args;
        return { id: buyerA, ...args.data };
      },
    },
  };
  const blob = { async deleteImages(urls: string[]) { deleted.push(urls); } };
  const service = new BuyerService(db as unknown as PrismaService, blob as unknown as BlobService);

  const result = await service.updateProfile(buyerA, { removeProfilePic: 'true' });

  assert.equal(updateArgs.data.profilePic, '');
  assert.equal(result.profilePic, '');
  assert.deepEqual(deleted, [['https://blob.example.invalid/avatar.jpg']]);
});
