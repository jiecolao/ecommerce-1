import { defineConfig } from "@prisma/config";

try {
  require("dotenv/config");
} catch (e) {
  // Ignore missing dotenv in Vercel since environment variables are injected natively
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
});
