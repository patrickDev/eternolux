import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { products } from "./products";
import { idDefault } from "./_shared";

export const productSummaries = sqliteTable(
  "product_summaries",
  {
    productSummaryId: text("product_summary_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),

    totalSold: integer("total_sold").notNull().default(0),
    totalRevenue: text("total_revenue").notNull().default("0.00"),
    lastSoldDate: text("last_sold_date"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    productUnique: uniqueIndex("product_summaries_product_id_unique").on(t.productId),
  })
);
