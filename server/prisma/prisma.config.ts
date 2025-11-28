
import dotenv from 'dotenv'
import { defineConfig, env } from "prisma/config";

// Ensure environment variables are loaded when this module is imported by Prisma
dotenv.config();

// Try to read DATABASE_URL from process.env first (dotenv), fall back to prisma/config's env helper
const databaseUrl = process.env.DATABASE_URL ?? (() => {
  try {
    return env("DATABASE_URL");
  } catch (e) {
    throw new Error("PrismaConfigEnvError: Missing required environment variable: DATABASE_URL. Make sure you have a .env file in the project root or set DATABASE_URL in the environment.");
  }
})();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { 
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: { 
    url: databaseUrl
  }
});
