import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to execute the raw insert to see the exact Postgres error
    await prisma.$executeRawUnsafe(`
      INSERT INTO public."Admin" (id, email, name, updated_at)
      VALUES (gen_random_uuid(), 'admin-test@example.com', 'Admin Name', NOW());
    `);
    console.log('Admin Insert succeeded!');
  } catch (error) {
    console.error('Insert failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
