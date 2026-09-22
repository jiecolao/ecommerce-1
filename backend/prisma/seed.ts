import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Wiping database before seeding...');

  // Delete in dependency order
  await prisma.logs.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.key.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.store.deleteMany();
  await prisma.type.deleteMany();
  await prisma.region.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Seeding database lookup tables...');

  // Seed Admin
  const adminId = '22222222-2222-2222-2222-222222222222';
  await prisma.admin.create({
    data: {
      id: adminId,
      email: 'demo-admin@example.com',
      name: 'Demo Admin',
    },
  });

  // Seed Customer
  const customerId = '11111111-1111-1111-1111-111111111111';
  await prisma.customer.create({
    data: {
      id: customerId,
      email: 'demo-customer@example.com',
      firstName: 'Demo',
      lastName: 'Customer',
      phone: '0987654321',
      address: '123 Demo St',
    },
  });

  // Seed Stores
  const stores = ['Steam', 'GOG', 'Epic Games', 'Microsoft Store'];
  for (let i = 0; i < stores.length; i++) {
    await prisma.store.create({
      data: { id: i + 1, name: stores[i] },
    });
  }

  // Seed Regions
  const regions = ['EU', 'US', 'Asia', 'Global'];
  for (let i = 0; i < regions.length; i++) {
    await prisma.region.create({
      data: { id: i + 1, name: regions[i] },
    });
  }

  // Seed Types
  const types = ['Game', 'DLC', 'Currency', 'Subscription'];
  for (let i = 0; i < types.length; i++) {
    await prisma.type.create({
      data: { id: i + 1, name: types[i] },
    });
  }

  // Seed Payment Methods
  const paymentMethods = ['QR Ph', 'PayPal', 'Card', 'Google Pay', 'Apple Pay'];
  for (let i = 0; i < paymentMethods.length; i++) {
    await prisma.paymentMethod.create({
      data: { id: i + 1, name: paymentMethods[i] },
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
