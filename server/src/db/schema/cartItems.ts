// db/schema/cartItems.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";
import { idDefault } from "./_shared";

export const cartItems = sqliteTable(
  "cart_items",
  {
    cartItemId: text("cart_item_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    price: text("price").notNull(), // Price at time of adding to cart

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("cart_items_user_idx").on(t.userId),
    // Ensure one product per user cart
    userProductIdx: index("cart_items_user_product_idx").on(t.userId, t.productId),
  })
);

// Export types
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
