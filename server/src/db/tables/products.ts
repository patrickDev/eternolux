import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { idDefault } from "./_shared";

export const products = sqliteTable("products", {
  productId: text("product_id").primaryKey().notNull().default(idDefault),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url"),
  rating: real("rating"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
