// db/schema/addresses.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const addresses = sqliteTable(
  "addresses",
  {
    addressId: text("address_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    // Address Type
    addressType: text("address_type", {
      enum: ["shipping", "billing", "both"],
    })
      .notNull()
      .default("shipping"),

    // Recipient Info
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),

    // Address Details
    street: text("street").notNull(),
    street2: text("street_2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    country: text("country").notNull().default("US"),

    // Default flag
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdIdx: index("addresses_user_id_idx").on(t.userId),
    defaultIdx: index("addresses_default_idx").on(t.userId, t.isDefault),
  })
);

// Export types
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
