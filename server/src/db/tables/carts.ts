import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const carts = sqliteTable(
  "carts",
  {
    cartId: text("cart_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userUnique: uniqueIndex("carts_user_id_unique").on(t.userId),
  })
);
