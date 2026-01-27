import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { idDefault } from "./_shared";

export const sellByCategories = sqliteTable(
  "sell_by_categories",
  {
    sellByCategoryId: text("sell_by_category_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    categoryId: text("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),

    totalRevenue: text("total_revenue").notNull().default("0.00"),
    totalProductsSold: integer("total_products_sold").notNull().default(0),
    lastSoldDate: text("last_sold_date"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    categoryUnique: uniqueIndex("sell_by_categories_category_id_unique").on(t.categoryId),
  })
);
