// db/client.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// ✅ Don't initialize at import time
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(env?: any) {
  // ✅ Only connect when called (lazy initialization)
  if (!db) {
    const url = env?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
    const authToken = env?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    if (!authToken) throw new Error("TURSO_AUTH_TOKEN is not set");

    const client = createClient({ url, authToken });
    db = drizzle(client, { schema });
  }
  
  return db;
}