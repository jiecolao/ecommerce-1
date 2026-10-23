import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const SEED_TAG = 'mystikeys-demo-seed';
const DEFAULT_KEYS_PER_GAME = 40;

type GameSeed = {
  title: string;
  appId: number;
  codePrefix: string;
  developer: string;
  publisher: string;
  price: string;
  rating: string;
  genres: string[];
};

const games: GameSeed[] = [
  { title: 'Helldivers 2', appId: 553850, codePrefix: 'HD2', developer: 'Arrowhead Game Studios', publisher: 'PlayStation Publishing', price: '1990.00', rating: '4.5', genres: ['Action', 'Co-op'] },
  { title: 'Palworld', appId: 1623730, codePrefix: 'PAL', developer: 'Pocketpair', publisher: 'Pocketpair', price: '1299.00', rating: '4.6', genres: ['Survival', 'Open World'] },
  { title: 'Elden Ring', appId: 1245620, codePrefix: 'ER', developer: 'FromSoftware', publisher: 'Bandai Namco Entertainment', price: '2399.00', rating: '4.9', genres: ['Action RPG', 'Souls-like'] },
  { title: 'Cyberpunk 2077', appId: 1091500, codePrefix: 'CP77', developer: 'CD Projekt Red', publisher: 'CD Projekt', price: '1799.00', rating: '4.7', genres: ['RPG', 'Open World'] },
  { title: "Baldur's Gate 3", appId: 1086940, codePrefix: 'BG3', developer: 'Larian Studios', publisher: 'Larian Studios', price: '2499.00', rating: '4.9', genres: ['RPG', 'Party-Based'] },
  { title: 'Red Dead Redemption 2', appId: 1174180, codePrefix: 'RDR2', developer: 'Rockstar Games', publisher: 'Rockstar Games', price: '1899.00', rating: '4.8', genres: ['Adventure', 'Open World'] },
  { title: 'Hogwarts Legacy', appId: 990080, codePrefix: 'HWL', developer: 'Avalanche Software', publisher: 'Warner Bros. Games', price: '1799.00', rating: '4.6', genres: ['Action RPG', 'Fantasy'] },
  { title: 'Resident Evil 4', appId: 2050650, codePrefix: 'RE4', developer: 'CAPCOM', publisher: 'CAPCOM', price: '1999.00', rating: '4.8', genres: ['Horror', 'Action'] },
  { title: 'Monster Hunter Wilds', appId: 2246340, codePrefix: 'MHW', developer: 'CAPCOM', publisher: 'CAPCOM', price: '3499.00', rating: '4.3', genres: ['Action RPG', 'Co-op'] },
  { title: 'Black Myth: Wukong', appId: 2358720, codePrefix: 'BMW', developer: 'Game Science', publisher: 'Game Science', price: '2399.00', rating: '4.7', genres: ['Action RPG', 'Mythology'] },
  { title: 'Final Fantasy VII Rebirth', appId: 2909400, codePrefix: 'FF7R', developer: 'Square Enix', publisher: 'Square Enix', price: '2999.00', rating: '4.6', genres: ['JRPG', 'Adventure'] },
  { title: 'God of War Ragnarok', appId: 2322010, codePrefix: 'GOWR', developer: 'Santa Monica Studio', publisher: 'PlayStation Publishing', price: '2999.00', rating: '4.7', genres: ['Action', 'Adventure'] },
  { title: 'Horizon Forbidden West Complete Edition', appId: 2420110, codePrefix: 'HFW', developer: 'Guerrilla', publisher: 'PlayStation Publishing', price: '2499.00', rating: '4.6', genres: ['Action RPG', 'Open World'] },
  { title: "No Man's Sky", appId: 275850, codePrefix: 'NMS', developer: 'Hello Games', publisher: 'Hello Games', price: '1499.00', rating: '4.6', genres: ['Exploration', 'Survival'] },
  { title: 'Stardew Valley', appId: 413150, codePrefix: 'SDV', developer: 'ConcernedApe', publisher: 'ConcernedApe', price: '499.00', rating: '4.9', genres: ['Simulation', 'Farming'] },
  { title: 'Terraria', appId: 105600, codePrefix: 'TER', developer: 'Re-Logic', publisher: 'Re-Logic', price: '399.00', rating: '4.9', genres: ['Sandbox', 'Adventure'] },
  { title: 'Hades II', appId: 1145350, codePrefix: 'HAD2', developer: 'Supergiant Games', publisher: 'Supergiant Games', price: '1099.00', rating: '4.8', genres: ['Roguelike', 'Action'] },
  { title: 'Hollow Knight', appId: 367520, codePrefix: 'HK', developer: 'Team Cherry', publisher: 'Team Cherry', price: '499.00', rating: '4.9', genres: ['Metroidvania', 'Action'] },
  { title: 'Dead Cells', appId: 588650, codePrefix: 'DC', developer: 'Motion Twin', publisher: 'Motion Twin', price: '699.00', rating: '4.8', genres: ['Roguelike', 'Metroidvania'] },
  { title: 'Celeste', appId: 504230, codePrefix: 'CEL', developer: 'Maddy Makes Games', publisher: 'Maddy Makes Games', price: '599.00', rating: '4.8', genres: ['Platformer', 'Indie'] },
  { title: 'Dave the Diver', appId: 1868140, codePrefix: 'DTD', developer: 'MINTROCKET', publisher: 'MINTROCKET', price: '699.00', rating: '4.8', genres: ['Adventure', 'Management'] },
  { title: 'The Witcher 3: Wild Hunt', appId: 292030, codePrefix: 'W3', developer: 'CD Projekt Red', publisher: 'CD Projekt', price: '1199.00', rating: '4.9', genres: ['RPG', 'Open World'] },
  { title: 'Sekiro: Shadows Die Twice', appId: 814380, codePrefix: 'SEK', developer: 'FromSoftware', publisher: 'Activision', price: '2299.00', rating: '4.8', genres: ['Action', 'Souls-like'] },
  { title: 'Street Fighter 6', appId: 1364780, codePrefix: 'SF6', developer: 'CAPCOM', publisher: 'CAPCOM', price: '1999.00', rating: '4.6', genres: ['Fighting', 'Competitive'] },
  { title: 'TEKKEN 8', appId: 1778820, codePrefix: 'TK8', developer: 'Bandai Namco Studios', publisher: 'Bandai Namco Entertainment', price: '2699.00', rating: '4.5', genres: ['Fighting', 'Competitive'] },
  { title: 'Persona 5 Royal', appId: 1687950, codePrefix: 'P5R', developer: 'ATLUS', publisher: 'SEGA', price: '2399.00', rating: '4.8', genres: ['JRPG', 'Story Rich'] },
  { title: 'Metaphor: ReFantazio', appId: 2679460, codePrefix: 'MET', developer: 'ATLUS', publisher: 'SEGA', price: '2999.00', rating: '4.7', genres: ['JRPG', 'Fantasy'] },
  { title: "Sid Meier's Civilization VI", appId: 289070, codePrefix: 'CIV6', developer: 'Firaxis Games', publisher: '2K', price: '1299.00', rating: '4.6', genres: ['Strategy', 'Turn-Based'] },
  { title: 'Cities: Skylines II', appId: 949230, codePrefix: 'CS2', developer: 'Colossal Order', publisher: 'Paradox Interactive', price: '2199.00', rating: '4.0', genres: ['Simulation', 'City Builder'] },
  { title: 'Euro Truck Simulator 2', appId: 227300, codePrefix: 'ETS2', developer: 'SCS Software', publisher: 'SCS Software', price: '599.00', rating: '4.9', genres: ['Simulation', 'Driving'] },
  { title: 'ARK: Survival Ascended', appId: 2399830, codePrefix: 'ARKA', developer: 'Studio Wildcard', publisher: 'Studio Wildcard', price: '1799.00', rating: '4.1', genres: ['Survival', 'Dinosaurs'] },
  { title: 'Rust', appId: 252490, codePrefix: 'RUST', developer: 'Facepunch Studios', publisher: 'Facepunch Studios', price: '1699.00', rating: '4.5', genres: ['Survival', 'Multiplayer'] },
  { title: 'Grand Theft Auto V Legacy', appId: 271590, codePrefix: 'GTAV', developer: 'Rockstar North', publisher: 'Rockstar Games', price: '1199.00', rating: '4.7', genres: ['Action', 'Open World'] },
  { title: 'The Elder Scrolls V: Skyrim Special Edition', appId: 489830, codePrefix: 'SKY', developer: 'Bethesda Game Studios', publisher: 'Bethesda Softworks', price: '1599.00', rating: '4.7', genres: ['RPG', 'Open World'] },
  { title: 'Fallout 4', appId: 377160, codePrefix: 'FO4', developer: 'Bethesda Game Studios', publisher: 'Bethesda Softworks', price: '999.00', rating: '4.5', genres: ['RPG', 'Post-Apocalyptic'] },
  { title: 'DARK SOULS III', appId: 374320, codePrefix: 'DS3', developer: 'FromSoftware', publisher: 'Bandai Namco Entertainment', price: '1999.00', rating: '4.8', genres: ['Action RPG', 'Souls-like'] },
  { title: 'Lies of P', appId: 1627720, codePrefix: 'LOP', developer: 'NEOWIZ', publisher: 'NEOWIZ', price: '2399.00', rating: '4.7', genres: ['Action RPG', 'Souls-like'] },
  { title: 'Crusader Kings III', appId: 1158310, codePrefix: 'CK3', developer: 'Paradox Development Studio', publisher: 'Paradox Interactive', price: '1999.00', rating: '4.6', genres: ['Strategy', 'Simulation'] },
  { title: 'Factorio', appId: 427520, codePrefix: 'FAC', developer: 'Wube Software', publisher: 'Wube Software', price: '1299.00', rating: '4.9', genres: ['Automation', 'Strategy'] },
  { title: 'Satisfactory', appId: 526870, codePrefix: 'SAT', developer: 'Coffee Stain Studios', publisher: 'Coffee Stain Publishing', price: '1499.00', rating: '4.8', genres: ['Automation', 'Open World'] },
  { title: 'RimWorld', appId: 294100, codePrefix: 'RIM', developer: 'Ludeon Studios', publisher: 'Ludeon Studios', price: '1399.00', rating: '4.9', genres: ['Colony Sim', 'Strategy'] },
  { title: 'Project Zomboid', appId: 108600, codePrefix: 'PZ', developer: 'The Indie Stone', publisher: 'The Indie Stone', price: '799.00', rating: '4.8', genres: ['Survival', 'Zombies'] },
  { title: 'Dead by Daylight', appId: 381210, codePrefix: 'DBD', developer: 'Behaviour Interactive', publisher: 'Behaviour Interactive', price: '799.00', rating: '4.4', genres: ['Horror', 'Multiplayer'] },
  { title: 'Phasmophobia', appId: 739630, codePrefix: 'PHAS', developer: 'Kinetic Games', publisher: 'Kinetic Games', price: '699.00', rating: '4.8', genres: ['Horror', 'Co-op'] },
  { title: 'Lethal Company', appId: 1966720, codePrefix: 'LC', developer: 'Zeekerss', publisher: 'Zeekerss', price: '399.00', rating: '4.8', genres: ['Horror', 'Co-op'] },
  { title: 'Sea of Thieves: 2025 Edition', appId: 1172620, codePrefix: 'SOT', developer: 'Rare', publisher: 'Xbox Game Studios', price: '1599.00', rating: '4.5', genres: ['Adventure', 'Multiplayer'] },
  { title: 'Forza Horizon 5', appId: 1551360, codePrefix: 'FH5', developer: 'Playground Games', publisher: 'Xbox Game Studios', price: '2499.00', rating: '4.7', genres: ['Racing', 'Open World'] },
  { title: 'Slay the Spire', appId: 646570, codePrefix: 'STS', developer: 'Mega Crit', publisher: 'Mega Crit', price: '699.00', rating: '4.9', genres: ['Card Game', 'Roguelike'] },
  { title: 'Vampire Survivors', appId: 1794680, codePrefix: 'VS', developer: 'poncle', publisher: 'poncle', price: '249.00', rating: '4.9', genres: ['Action', 'Roguelike'] },
  { title: 'Deep Rock Galactic', appId: 548430, codePrefix: 'DRG', developer: 'Ghost Ship Games', publisher: 'Coffee Stain Publishing', price: '799.00', rating: '4.9', genres: ['Co-op', 'Shooter'] },
];

const dryRun = process.argv.includes('--dry-run');
const keysPerGame = Number.parseInt(process.env.SEED_KEYS_PER_GAME ?? `${DEFAULT_KEYS_PER_GAME}`, 10);
if (!Number.isInteger(keysPerGame) || keysPerGame < 1 || keysPerGame > 500) {
  throw new Error('SEED_KEYS_PER_GAME must be an integer between 1 and 500.');
}

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) throw new Error('DATABASE_URL or DIRECT_URL must be configured before seeding.');

const pool = new Pool({ connectionString, max: 3 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as never);

async function ensureStore(name: string) {
  const existing = await prisma.store.findFirst({ where: { name } });
  if (existing) return existing;
  if (dryRun) throw new Error(`Missing required Store lookup: ${name}`);
  return prisma.store.create({ data: { name } });
}

async function ensureType(name: string) {
  const existing = await prisma.type.findFirst({ where: { name } });
  if (existing) return existing;
  if (dryRun) throw new Error(`Missing required Type lookup: ${name}`);
  return prisma.type.create({ data: { name } });
}

async function ensureRegion(name: string) {
  const existing = await prisma.region.findFirst({ where: { name } });
  if (existing) return existing;
  if (dryRun) throw new Error(`Missing required Region lookup: ${name}`);
  return prisma.region.create({ data: { name } });
}

async function main() {
  const requestedAdminId = process.env.SEED_ADMIN_ID?.trim();
  const admin = requestedAdminId
    ? await prisma.admin.findUnique({ where: { id: requestedAdminId } })
    : (await prisma.admin.findFirst({
        where: { email: { not: 'demo-admin@example.com' } },
        orderBy: { createdAt: 'desc' },
      })) ?? await prisma.admin.findFirst({ orderBy: { createdAt: 'desc' } });

  if (!admin) {
    throw new Error('No administrator exists. Create or sign in with an admin account before seeding products.');
  }

  const [steam, gameType, globalRegion] = await Promise.all([
    ensureStore('Steam'),
    ensureType('Game'),
    ensureRegion('Global'),
  ]);

  const totals = {
    productsCreated: 0,
    variantsCreated: 0,
    keysCreated: 0,
    productsAlreadyPresent: 0,
  };

  for (const game of games) {
    const desiredCodes = Array.from(
      { length: keysPerGame },
      (_, index) => `DEMO-${game.codePrefix}-${String(index + 1).padStart(4, '0')}-NOT-FOR-RESALE`,
    );

    const result = await prisma.$transaction(async tx => {
      let product = await tx.product.findFirst({
        where: { title: game.title, tags: { has: SEED_TAG } },
      });
      let productCreated = false;

      if (!product) {
        if (dryRun) {
          return { productCreated: true, variantCreated: true, keysCreated: desiredCodes.length };
        }
        product = await tx.product.create({
          data: {
            adminId: admin.id,
            title: game.title,
            media: [`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`],
            description: `${game.title} for PC. This seeded listing uses demonstration inventory and links to the official Steam catalog page for product-specific details.`,
            rating: game.rating,
            developer: game.developer,
            publisher: game.publisher,
            systemRequirements: 'Windows 10/11 64-bit, 8 GB RAM, a DirectX-compatible GPU, and broadband internet. Check the official store page for title-specific requirements.',
            tags: [...game.genres, 'PC', 'Steam', SEED_TAG],
            status: 'ACTIVE',
          },
        });
        productCreated = true;
      }

      let variant = await tx.productVariant.findUnique({
        where: {
          productId_storeId_typeId_name: {
            productId: product.id,
            storeId: steam.id,
            typeId: gameType.id,
            name: 'Standard Edition',
          },
        },
      });
      let variantCreated = false;

      if (!variant) {
        if (dryRun) {
          return { productCreated, variantCreated: true, keysCreated: desiredCodes.length };
        }
        variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            storeId: steam.id,
            typeId: gameType.id,
            regionId: globalRegion.id,
            name: 'Standard Edition',
            storePage: `https://store.steampowered.com/app/${game.appId}`,
            price: game.price,
            activationGuide: 'Open Steam, choose Games > Activate a Product on Steam, and enter the delivered key.',
            languageSupport: ['English'],
          },
        });
        variantCreated = true;
      }

      const existingCodes = await tx.key.findMany({
        where: { productVariantId: variant.id, code: { in: desiredCodes } },
        select: { code: true },
      });
      const existingCodeSet = new Set(existingCodes.map(key => key.code));
      const missingCodes = desiredCodes.filter(code => !existingCodeSet.has(code));

      if (!dryRun && missingCodes.length > 0) {
        await tx.key.createMany({
          data: missingCodes.map(code => ({
            productVariantId: variant.id,
            code,
            codeType: 'KEY',
            status: 'AVAILABLE',
          })),
        });
      }

      if (!dryRun && productCreated) {
        await tx.logs.create({
          data: {
            updatedBy: admin.id,
            tableName: 'PRODUCT',
            recordId: product.id,
            updateAction: 'CREATE',
            updateDiff: { old: null, new: { title: product.title, source: SEED_TAG } },
          },
        });
      }

      return { productCreated, variantCreated, keysCreated: missingCodes.length };
    });

    totals.productsCreated += Number(result.productCreated);
    totals.variantsCreated += Number(result.variantCreated);
    totals.keysCreated += result.keysCreated;
    totals.productsAlreadyPresent += Number(!result.productCreated);
  }

  const mode = dryRun ? 'Dry run' : 'Seed complete';
  console.log(`${mode}: ${JSON.stringify({ gamesRequested: games.length, keysPerGame, ...totals })}`);
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
