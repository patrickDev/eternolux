import { sql } from "drizzle-orm";

export const idDefault = sql`(lower(hex(randomblob(8))))`;
