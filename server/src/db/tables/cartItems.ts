import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { carts } from "./carts";
import { products } from "./products";
import { idDefault } from "./_shared";

export const cartItems = sqliteTable(
  "cart_items",
  {
    cartItemId: text("cart_item_id").primaryKey().notNull().default(idDefault),
    cartId: text("cart_id").notNull().references(() => carts.cartId, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.productId),
    quantity: integer("quantity").notNull(),
  },
  (t) => ({
    cartIdx: index("cart_items_cart_id_idx").on(t.cartId),
    productIdx: index("cart_items_product_id_idx").on(t.productId),
  })
);
