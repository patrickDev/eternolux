import { sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core";
import { products } from "./products";
import { categories } from "./categories";

export const productCategories = sqliteTable(
  "product_categories",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
    productIdx: index("product_categories_product_id_idx").on(t.productId),
    categoryIdx: index("product_categories_category_id_idx").on(t.categoryId),
  })
);
