import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { idDefault } from "./_shared";

export const sellSummaries = sqliteTable("sell_summaries", {
  sellSummaryId: text("sell_summary_id")
    .primaryKey()
    .notNull()
    .default(idDefault),

  totalRevenue: text("total_revenue")
    .notNull()
    .default("0.00"),

  totalOrders: integer("total_orders")
    .notNull()
    .default(0),

  totalProductsSold: integer("total_products_sold")
    .notNull()
    .default(0),

  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
