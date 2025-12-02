import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env");
}

// Create the adapter instance
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Export prisma as a named export
export const prisma = new PrismaClient({
  adapter,
  log: ["query", "info"], // optional logging
});
