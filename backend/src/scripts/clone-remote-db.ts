import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Local Prisma client
const localPool = new Pool({ connectionString: process.env.DATABASE_URL });
const localAdapter = new PrismaPg(localPool);
const localPrisma = new PrismaClient({ adapter: localAdapter });

// Remote Prisma client
const remotePool = new Pool({ connectionString: process.env.REMOTE_DATABASE_URL });
const remoteAdapter = new PrismaPg(remotePool);
const remotePrisma = new PrismaClient({ adapter: remoteAdapter });

async function main() {
  if (!process.env.REMOTE_DATABASE_URL) {
    throw new Error('REMOTE_DATABASE_URL is missing in your .env file!');
  }

  console.log('Connecting to remote and local databases...');

  // Optional: Clean up local DB before importing
  console.log('Cleaning local database...');
  await localPrisma.order.deleteMany();
  await localPrisma.productVariant.deleteMany();
  await localPrisma.product.deleteMany();
  await localPrisma.store.deleteMany();
  await localPrisma.type.deleteMany();
  await localPrisma.admin.deleteMany();
  await localPrisma.customer.deleteMany();

  console.log('Fetching remote data (limit: 10 per entity for testing)...');
  
  // 1. Fetch Sellers and Buyers
  const admins = await remotePrisma.admin.findMany({ take: 10 });
  const buyers = await remotePrisma.customer.findMany({ take: 10 });
  
  // 2. Fetch Lookup tables
  const stores = await remotePrisma.store.findMany();
  const types = await remotePrisma.type.findMany();

  // 3. Fetch Products and Variants
  const products = await remotePrisma.product.findMany({
    take: 10,
    include: { productVariants: true },
  });

  console.log('Writing data to local database...');

  // Insert Sellers
  if (admins.length > 0) {
    await localPrisma.admin.createMany({ data: admins, skipDuplicates: true });
  }

  // Insert Buyers
  if (buyers.length > 0) {
    await localPrisma.customer.createMany({ data: buyers, skipDuplicates: true });
  }

  // Insert Stores & Types
  if (stores.length > 0) {
    await localPrisma.store.createMany({ data: stores, skipDuplicates: true });
  }
  if (types.length > 0) {
    await localPrisma.type.createMany({ data: types, skipDuplicates: true });
  }

  // Insert Products (Since productVariants are nested, we loop or extract them)
  for (const p of products) {
    const { productVariants, ...productData } = p;
    
    // Create product
    await localPrisma.product.upsert({
      where: { id: p.id },
      update: productData,
      create: productData,
    });

    // Create its variants
    if (productVariants.length > 0) {
      await localPrisma.productVariant.createMany({
        data: productVariants,
        skipDuplicates: true,
      });
    }
  }

  console.log('Remote data successfully cloned to local database!');
}

main()
  .catch((e) => {
    console.error('Error during cloning:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
    await localPool.end();
    await remotePool.end();
  });
