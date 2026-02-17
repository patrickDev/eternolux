import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".dev.vars"),
  override: true, // ✅ IMPORTANT: overwrite any existing env vars
});

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .dev.vars");
}

// ✅ TEMP DEBUG (remove after you confirm)
console.log("DRIZZLE-KIT USING URL:", url);

export default defineConfig({
  schema: ["./src/db/schema/**/*.ts"],
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: { url, authToken },
  verbose: true,
  strict: true,
});
