import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Upsert Admin
  const adminId = '22222222-2222-2222-2222-222222222222';
  await prisma.admin.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      email: 'demo-admin@example.com',
      name: 'Demo Admin',
    },
  });

  // Upsert Buyer
  const buyerId = '11111111-1111-1111-1111-111111111111';
  await prisma.buyer.upsert({
    where: { id: buyerId },
    update: {},
    create: {
      id: buyerId,
      email: 'demo-buyer@example.com',
      firstName: 'Demo',
      lastName: 'Buyer',
      phone: '0987654321',
      address: '123 Demo St',
    },
  });

  // Seed Stores
  const stores = ['Steam', 'GOG', 'Epic Games', 'Microsoft Store'];
  for (let i = 0; i < stores.length; i++) {
    await prisma.store.upsert({
      where: { id: i + 1 },
      update: { name: stores[i] },
      create: { id: i + 1, name: stores[i] },
    });
  }

  // Seed Regions
  const regions = ['EU', 'US', 'Asia', 'Global'];
  for (let i = 0; i < regions.length; i++) {
    await prisma.region.upsert({
      where: { id: i + 1 },
      update: { name: regions[i] },
      create: { id: i + 1, name: regions[i] },
    });
  }

  // Seed Types
  const types = ['Game', 'DLC', 'Currency', 'Subscription'];
  for (let i = 0; i < types.length; i++) {
    await prisma.type.upsert({
      where: { id: i + 1 },
      update: { name: types[i] },
      create: { id: i + 1, name: types[i] },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
