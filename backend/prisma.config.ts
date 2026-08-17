import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Prisma 7 CLI operations (like migrations) use this url
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
});
