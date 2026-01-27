import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const shippingAddresses = sqliteTable(
  "shipping_addresses",
  {
    shippingAddressId: text("shipping_address_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    country: text("country").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("shipping_addresses_user_id_idx").on(t.userId),
  })
);
