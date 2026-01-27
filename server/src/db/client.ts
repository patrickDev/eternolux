import "dotenv/config";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is missing");
// }

// const client = createClient({
//   url: process.env.DATABASE_URL,
//   authToken: process.env.DATABASE_AUTH_TOKEN,
// });

const client = createClient({
  url: "libsql://turso-db-nypahe.aws-us-east-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njc0NzgyOTUsImlkIjoiZjg3MzVmZmItNGUzOS00YTAyLTg3YzUtYmZlOTZmOWZlMzY0IiwicmlkIjoiY2VkMjcxNWQtYmE0ZS00MDVlLTg5OWMtYTUyNzIyZDE1OWYxIn0.hxD6PoGYc-7gveFW4AdAAVW1_EYqSQv8OFA72W_-55MsYb6fnLaNkEQOJCsoDcit-9KeZFXAwj_81jMqohQJBA",
});


/**
 * Explicit type annotation is REQUIRED
 * to avoid circular inference
 */
export const db: LibSQLDatabase<typeof schema> = drizzle(client, {
  schema,
});
