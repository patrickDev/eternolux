import "dotenv/config";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

/**
 * Explicit type annotation is REQUIRED
 * to avoid circular inference
 */
export const db: LibSQLDatabase<typeof schema> = drizzle(client, {
  schema,
});
