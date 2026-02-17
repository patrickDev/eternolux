// db/schema/wishlist.ts
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";
import { idDefault } from "./_shared";

export const wishlist = sqliteTable(
  "wishlist",
  {
    wishlistItemId: text("wishlist_item_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),

    // Timestamps
    addedAt: text("added_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("wishlist_user_idx").on(t.userId),
    productIdx: index("wishlist_product_idx").on(t.productId),
    // Ensure one product per user wishlist
    userProductIdx: index("wishlist_user_product_idx").on(t.userId, t.productId),
  })
);

// Export types
export type WishlistItem = typeof wishlist.$inferSelect;
export type NewWishlistItem = typeof wishlist.$inferInsert;
