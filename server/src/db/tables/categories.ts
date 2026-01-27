import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { idDefault } from "./_shared";

export const categories = sqliteTable(
  "categories",
  {
    categoryId: text("category_id").primaryKey().notNull().default(idDefault),
    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => ({
    nameUnique: uniqueIndex("categories_name_unique").on(t.name),
  })
);
