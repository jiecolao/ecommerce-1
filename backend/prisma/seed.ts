import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Upsert Seller
  const sellerId = '22222222-2222-2222-2222-222222222222';
  await prisma.seller.upsert({
    where: { id: sellerId },
    update: {},
    create: {
      id: sellerId,
      email: 'demo-seller@example.com',
      businessName: 'Demo Games Studio',
      phone: '1234567890',
      rating: 5,
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
  const store1 = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Steam' },
  });
  const store2 = await prisma.store.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Epic Games' },
  });

  // Seed Types
  const type1 = await prisma.type.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Key' },
  });
  const type2 = await prisma.type.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Account' },
  });
  const type3 = await prisma.type.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Gift' },
  });

  // Seed Products
  const product = await prisma.product.upsert({
    where: { id: 12 },
    update: {},
    create: {
      id: 12,
      sellerId: sellerId,
      title: 'Tunic',
      description: 'Explore a land filled with lost legends, ancient powers, and ferocious monsters in TUNIC.',
      developer: 'TUNIC Team',
      publisher: 'Finji',
      media: [
        'https://bxzoqhejt3zgkv9j.public.blob.vercel-storage.com/products/12/Tunic_Poster.jpg'
      ],
      productVariants: {
        create: [
          {
            id: 11,
            storeId: store1.id,
            typeId: type1.id,
            name: 'Standard Edition',
            region: 1,
            languageSupport: ['English'],
            price: 5999,
          },
        ],
      },
    },
  });

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
