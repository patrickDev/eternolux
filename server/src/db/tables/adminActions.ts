import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { idDefault } from "./_shared";

export const adminActions = sqliteTable(
  "admin_actions",
  {
    adminActionId: text("admin_action_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    adminId: text("admin_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    actionType: text("action_type").notNull(),
    details: text("details"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    adminIdx: index("admin_actions_admin_id_idx").on(t.adminId),
    typeIdx: index("admin_actions_action_type_idx").on(t.actionType),
  })
);
