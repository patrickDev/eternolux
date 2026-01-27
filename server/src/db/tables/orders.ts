import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { shippingAddresses } from "./shippingAddresses";
import { idDefault } from "./_shared";

export const orders = sqliteTable(
  "orders",
  {
    orderId: text("order_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    shippingAddressId: text("shipping_address_id").references(
      () => shippingAddresses.shippingAddressId,
      { onDelete: "set null" }
    ),
    status: text("status").notNull().default("Pending"),
    totalPrice: text("total_price").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("orders_user_id_idx").on(t.userId),
    statusIdx: index("orders_status_idx").on(t.status),
  })
);
