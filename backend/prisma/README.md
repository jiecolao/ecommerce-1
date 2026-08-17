# Prisma ORM & Supabase Integration Guide

This directory manages the database schema, migrations, and seeding using Prisma ORM, fully configured for **Supabase PostgreSQL**. All prior references to Neon DB have been removed.

## Architecture

Supabase provides a powerful PostgreSQL database with built-in connection pooling. We use Prisma as the ORM to interact with it.

- **`schema.prisma`**: The single source of truth for the database schema.
- **`DATABASE_URL`**: Used by the Prisma Client for day-to-day operations. This should point to the Supabase connection pooler (usually ends in `:6543` and includes `pgbouncer=true`).
- **`DIRECT_URL`**: Used by Prisma for running migrations (since migrations require a direct connection, not pooled). This should point directly to the Supabase Postgres instance (usually ends in `:5432`).

## Setup & Configuration

1. **Environment Variables**
   Ensure your `.env` file contains both connection strings from your Supabase dashboard (Settings > Database):
   ```env
   # Transaction connection pooler for Prisma Client
   DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   
   # Direct connection for Prisma Migrations
   DIRECT_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```

2. **Generate Prisma Client**
   Run this whenever `schema.prisma` changes to generate the updated TypeScript types:
   ```bash
   npx prisma generate
   ```

## Migrations Workflow

We rely on Prisma's migration system rather than the Supabase CLI for database schema evolution.

### Creating a Migration (Local / Dev)
When you modify `schema.prisma` (e.g., adding a new table or field), create a migration:
```bash
npx prisma migrate dev --name <descriptive_name>
```
This will:
1. Connect via the `DIRECT_URL`.
2. Generate a new SQL migration file in `prisma/migrations/`.
3. Apply the migration to your database.
4. Auto-generate the Prisma Client.

### Applying Migrations (Production / CI)
To apply existing migrations to a new environment (like production) without resetting the database:
```bash
npx prisma migrate deploy
```

### Resetting the Database
If you need to wipe the database and re-apply all migrations from scratch (WARNING: Data loss):
```bash
npx prisma migrate reset
```

## Seeding Data (Direct Non-Vercel CLI Seeding)

We use Prisma's built-in seeding functionality. This allows you to write seed scripts in TypeScript and execute them directly against your Supabase database, without relying on Vercel's CLI or other external tools.

### 1. Setup the Seed Script
Create a `seed.ts` file in the `prisma` folder (e.g., `prisma/seed.ts`):
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const seller = await prisma.seller.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      businessName: 'Example Store',
    },
  })
  console.log('Seeded Seller:', seller)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 2. Configure package.json
Ensure your `package.json` has the prisma seed command configured:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### 3. Run the Seeder
Execute the seed script against your Supabase instance:
```bash
npx prisma db seed
```
This will use the `DATABASE_URL` to connect and inject the test data.

## Supabase Auth & UUIDs

- We have decoupled traditional password handling from our Prisma schema. 
- The `Buyer` and `Seller` models now use `UUID`s (`String @id @default(uuid()) @db.Uuid`).
- These UUIDs should ideally map directly to the `id` field inside Supabase's built-in `auth.users` table. When a user signs up via Supabase Auth, a trigger or a subsequent API call can insert a corresponding row into our `Buyer` or `Seller` table using the same UUID.

## Testing Your Database Connection

If you want to verify that your `DATABASE_URL` and `DIRECT_URL` are set up correctly without actually modifying the database, you can run the safe connection test script:

```bash
npm run db:test
```

This command invokes a dedicated script (`src/scripts/test-db.ts`) that will simply attempt to connect to the database via Prisma and report success or failure. It is completely safe to run in any environment as it does not execute any queries or apply any migrations.
