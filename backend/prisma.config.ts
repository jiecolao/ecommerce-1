import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

try {
  require("dotenv/config");
} catch (e) {
  // Ignore missing dotenv in Vercel since environment variables are injected natively
}

dotenv.config({
  path: "../.env.local",
});

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
});
