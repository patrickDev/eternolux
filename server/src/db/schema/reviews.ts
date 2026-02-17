// db/schema/reviews.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";
import { orders } from "./orders";
import { idDefault } from "./_shared";

export const reviews = sqliteTable(
  "reviews",
  {
    reviewId: text("review_id").primaryKey().notNull().default(idDefault),
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    orderId: text("order_id").references(() => orders.orderId, { onDelete: "set null" }),

    // Review Content
    rating: integer("rating").notNull(), // 1-5
    title: text("title"),
    comment: text("comment"),
    images: text("images", { mode: "json" }).$type<string[]>(),

    // Metadata
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    helpful: integer("helpful").default(0),

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    productIdx: index("reviews_product_idx").on(t.productId),
    userIdx: index("reviews_user_idx").on(t.userId),
    ratingIdx: index("reviews_rating_idx").on(t.rating),
    verifiedIdx: index("reviews_verified_idx").on(t.productId, t.verified),
    // Ensure one review per user per product
    productUserIdx: index("reviews_product_user_idx").on(t.productId, t.userId),
  })
);

// Export types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
