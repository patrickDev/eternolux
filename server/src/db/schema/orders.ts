// db/schema/orders.ts
import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { products } from "./products";
import { idDefault } from "./_shared";

export const orders = sqliteTable(
  "orders",
  {
    orderId: text("order_id").primaryKey().notNull().default(idDefault),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    orderNumber: text("order_number").notNull(),

    // Pricing
    subtotal: text("subtotal").notNull(),
    tax: text("tax").notNull(),
    shipping: text("shipping").notNull(),
    discount: text("discount"),
    total: text("total").notNull(),

    // Status
    status: text("status", {
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
    })
      .notNull()
      .default("pending"),
    paymentStatus: text("payment_status", {
      enum: ["pending", "paid", "failed", "refunded"],
    })
      .notNull()
      .default("pending"),

    // Shipping Address (denormalized for order history)
    shippingAddressId: text("shipping_address_id").notNull(),
    shippingFirstName: text("shipping_first_name").notNull(),
    shippingLastName: text("shipping_last_name").notNull(),
    shippingPhone: text("shipping_phone").notNull(),
    shippingStreet: text("shipping_street").notNull(),
    shippingStreet2: text("shipping_street_2"),
    shippingCity: text("shipping_city").notNull(),
    shippingState: text("shipping_state").notNull(),
    shippingZipCode: text("shipping_zip_code").notNull(),
    shippingCountry: text("shipping_country").notNull(),

    // Billing Address (denormalized for order history)
    billingAddressId: text("billing_address_id").notNull(),
    billingFirstName: text("billing_first_name").notNull(),
    billingLastName: text("billing_last_name").notNull(),
    billingPhone: text("billing_phone").notNull(),
    billingStreet: text("billing_street").notNull(),
    billingStreet2: text("billing_street_2"),
    billingCity: text("billing_city").notNull(),
    billingState: text("billing_state").notNull(),
    billingZipCode: text("billing_zip_code").notNull(),
    billingCountry: text("billing_country").notNull(),

    // Tracking
    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),
    estimatedDelivery: text("estimated_delivery"),

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    paidAt: text("paid_at"),
    shippedAt: text("shipped_at"),
    deliveredAt: text("delivered_at"),
  },
  (t) => ({
    orderNumberUnique: uniqueIndex("orders_order_number_unique").on(t.orderNumber),
    userIdx: index("orders_user_idx").on(t.userId),
    statusIdx: index("orders_status_idx").on(t.status),
    paymentStatusIdx: index("orders_payment_status_idx").on(t.paymentStatus),
    userDateIdx: index("orders_user_date_idx").on(t.userId, t.createdAt),
  })
);

export const orderItems = sqliteTable(
  "order_items",
  {
    orderItemId: text("order_item_id").primaryKey().notNull().default(idDefault),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "set null" }),

    // Product snapshot (denormalized for order history)
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    productSku: text("product_sku").notNull(),

    // Pricing
    quantity: integer("quantity").notNull(),
    price: text("price").notNull(), // Price at time of purchase
    subtotal: text("subtotal").notNull(), // quantity * price

    // Timestamps
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
    productIdx: index("order_items_product_idx").on(t.productId),
  })
);

// Export types
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
