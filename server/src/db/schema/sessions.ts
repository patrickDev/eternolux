// db/schema/sessions.ts
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const sessions = sqliteTable(
  "sessions",
  {
    sessionId: text("session_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    
    // Session metadata
    token: text("token").notNull().unique(), // JWT or random token
    
    // Device/Browser info
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    
    // Expiration
    expiresAt: text("expires_at").notNull(),
    
    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastActivityAt: text("last_activity_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdIdx: index("sessions_user_id_idx").on(t.userId),
    tokenIdx: index("sessions_token_idx").on(t.token),
    expiresAtIdx: index("sessions_expires_at_idx").on(t.expiresAt),
  })
);

// Export types
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;