// db/schema/users.ts
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { idDefault } from "./_shared";

export const users = sqliteTable(
  "users",
  {
    userId: text("user_id").primaryKey().notNull().default(idDefault),

    // Basic Info
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),

    // Profile
    profileImageUrl: text("profile_image_url"),
    dateOfBirth: text("date_of_birth"),

    // Verification & Security
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    phoneVerified: integer("phone_verified", { mode: "boolean" }).notNull().default(false),
    twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).notNull().default(false),

    // Admin & Status
    isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
    status: text("status", {
      enum: ["active", "suspended", "deleted"],
    })
      .notNull()
      .default("active"),

    // Timestamps
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
    statusIdx: uniqueIndex("users_status_idx").on(t.status),
  })
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
