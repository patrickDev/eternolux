// db/schema/products.ts
import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const products = sqliteTable(
  "products",
  {
    productId: text("product_id").primaryKey().notNull().default(idDefault),

    // Basic Info
    name: text("name").notNull(),
    description: text("description"),
    sku: text("sku").notNull(),
    brand: text("brand"),
    category: text("category").notNull(),
    tags: text("tags", { mode: "json" }).$type<string[]>(),

    // Pricing
    price: real("price").notNull(),
    originalPrice: real("original_price"),
    costPrice: real("cost_price"),

    // Inventory
    stock: integer("stock").notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(10),

    // Media
    imageUrl: text("image_url"),
    images: text("images", { mode: "json" }).$type<string[]>(),

    // Product Details
    weight: real("weight"),
    dimensions: text("dimensions", { mode: "json" }).$type<{
      length: number;
      width: number;
      height: number;
      unit: "cm" | "in";
    }>(),

    // Ratings & Reviews
    rating: real("rating"),
    reviewCount: integer("review_count").default(0),

    // Seller
    sellerId: text("seller_id").references(() => users.userId, { onDelete: "set null" }),

    // Status & Visibility
    status: text("status", {
      enum: ["active", "draft", "out_of_stock", "discontinued"],
    })
      .notNull()
      .default("active"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),

    // SEO
    slug: text("slug"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // Analytics
    views: integer("views").default(0),
    purchases: integer("purchases").default(0),

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    skuUnique: uniqueIndex("products_sku_unique").on(t.sku),
    slugUnique: uniqueIndex("products_slug_unique").on(t.slug),
    categoryIdx: index("products_category_idx").on(t.category),
    statusFeaturedIdx: index("products_status_featured_idx").on(t.status, t.isFeatured),
    sellerIdx: index("products_seller_idx").on(t.sellerId),
    ratingIdx: index("products_rating_idx").on(t.rating),
  })
);

// Export types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
