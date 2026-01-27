import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const orderSummaries = sqliteTable(
  "order_summaries",
  {
    orderSummaryId: text("order_summary_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    totalOrders: integer("total_orders").notNull().default(0),
    totalSpent: text("total_spent").notNull().default("0.00"),
    lastOrderDate: text("last_order_date"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userUnique: uniqueIndex("order_summaries_user_id_unique").on(t.userId),
  })
);
