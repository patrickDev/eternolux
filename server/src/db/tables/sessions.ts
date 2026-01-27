import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const sessions = sqliteTable(
  "sessions",
  {
    sessionId: text("session_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    expiresAt: text("expires_at").notNull(),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("sessions_user_id_idx").on(t.userId),
    expiresIdx: index("sessions_expires_at_idx").on(t.expiresAt),
  })
);
