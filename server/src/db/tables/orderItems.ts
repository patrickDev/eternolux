import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { orders } from "./orders";
import { products } from "./products";
import { idDefault } from "./_shared";

export const orderItems = sqliteTable(
  "order_items",
  {
    orderItemId: text("order_item_id").primaryKey().notNull().default(idDefault),
    orderId: text("order_id").notNull().references(() => orders.orderId, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.productId),
    quantity: integer("quantity").notNull(),
    price: text("price").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_id_idx").on(t.orderId),
    productIdx: index("order_items_product_id_idx").on(t.productId),
  })
);
