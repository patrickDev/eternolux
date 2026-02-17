import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

async function main() {
  const url = "libsql://turso-db-nypahe.aws-us-east-2.turso.io";
  const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njc0NzgyOTUsImlkIjoiZjg3MzVmZmItNGUzOS00YTAyLTg3YzUtYmZlOTZmOWZlMzY0IiwicmlkIjoiY2VkMjcxNWQtYmE0ZS00MDVlLTg5OWMtYTUyNzIyZDE1OWYxIn0.hxD6PoGYc-7gveFW4AdAAVW1_EYqSQv8OFA72W_-55MsYb6fnLaNkEQOJCsoDcit-9KeZFXAwj_81jMqohQJBA";

  if (!url) throw new Error("Missing TURSO_DATABASE_URL");
  if (!authToken) throw new Error("Missing TURSO_AUTH_TOKEN");

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  const result = await db.$client.execute("SELECT 1 AS test;");
  console.log(result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


