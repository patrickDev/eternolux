import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/**
 * SQLite does not have UUID type.
 * Use TEXT PK and generate UUID in one of these ways:
 * 1) App-side UUID (recommended): crypto.randomUUID()
 * 2) DB default: lower(hex(randomblob(16))) (not RFC4122 but unique enough in practice)
 *
 * If you want RFC4122 UUIDs, generate them in the app.
 */
const idDefault = sql`(lower(hex(randomblob(16))))`;

/**
 * “Enums” in SQLite: store as TEXT and enforce via application logic.
 * (SQLite CHECK constraints exist, but some environments/tools handle migrations inconsistently.)
 */
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type AdminActionType =
  | "CreateProduct"
  | "UpdateProduct"
  | "DeleteProduct"
  | "ManageUser"
  | "RefundOrder"
  | "Other";

/**
 * USERS
 */
export const users = sqliteTable(
  "users",
  {
    userId: text("user_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),

    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),

    isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),

    // Store as ISO string using CURRENT_TIMESTAMP (UTC).
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

/**
 * PRODUCTS
 *
 * Money: in SQLite you have two sane options:
 * A) store money in INTEGER cents (recommended)
 * B) store in TEXT decimal "12.34"
 *
 * Your Prisma schema uses Decimal(10,2). Here I’ll model as TEXT to stay closest.
 * If you prefer cents, tell me and I’ll convert the schema accordingly.
 */
export const products = sqliteTable("products", {
  productId: text("product_id")
    .primaryKey()
    .notNull()
    .default(idDefault),

  name: text("name").notNull(),
  description: text("description"),

  // Decimal stored as TEXT e.g. "19.99"
  price: text("price").notNull(),

  stock: integer("stock").notNull(),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

  imageUrl: text("image_url"),

  // float
  rating: real("rating"),
});

/**
 * CATEGORIES
 */
export const categories = sqliteTable(
  "categories",
  {
    categoryId: text("category_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => ({
    nameUnique: uniqueIndex("categories_name_unique").on(t.name),
  })
);

/**
 * PRODUCT_CATEGORIES (many-to-many)
 */
export const productCategories = sqliteTable(
  "product_categories",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),

    categoryId: text("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
    productIdx: index("product_categories_product_id_idx").on(t.productId),
    categoryIdx: index("product_categories_category_id_idx").on(t.categoryId),
  })
);

/**
 * SHIPPING_ADDRESSES
 */
export const shippingAddresses = sqliteTable(
  "shipping_addresses",
  {
    shippingAddressId: text("shipping_address_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

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

/**
 * ORDERS
 */
export const orders = sqliteTable(
  "orders",
  {
    orderId: text("order_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    shippingAddressId: text("shipping_address_id").references(
      () => shippingAddresses.shippingAddressId,
      { onDelete: "set null" }
    ),

    status: text("status").notNull().default("Pending"),

    // Decimal stored as TEXT e.g. "120.50"
    totalPrice: text("total_price").notNull(),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userIdx: index("orders_user_id_idx").on(t.userId),
    shippingIdx: index("orders_shipping_address_id_idx").on(t.shippingAddressId),
    statusIdx: index("orders_status_idx").on(t.status),
  })
);

/**
 * ORDER_ITEMS
 */
export const orderItems = sqliteTable(
  "order_items",
  {
    orderItemId: text("order_item_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    orderId: text("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),

    productId: text("product_id")
      .notNull()
      .references(() => products.productId),

    quantity: integer("quantity").notNull(),

    // Decimal stored as TEXT e.g. "19.99"
    price: text("price").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_id_idx").on(t.orderId),
    productIdx: index("order_items_product_id_idx").on(t.productId),
  })
);

/**
 * CARTS (1 cart per user)
 */
export const carts = sqliteTable(
  "carts",
  {
    cartId: text("cart_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userUnique: uniqueIndex("carts_user_id_unique").on(t.userId),
  })
);

/**
 * CART_ITEMS
 */
export const cartItems = sqliteTable(
  "cart_items",
  {
    cartItemId: text("cart_item_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    cartId: text("cart_id")
      .notNull()
      .references(() => carts.cartId, { onDelete: "cascade" }),

    productId: text("product_id")
      .notNull()
      .references(() => products.productId),

    quantity: integer("quantity").notNull(),
  },
  (t) => ({
    cartIdx: index("cart_items_cart_id_idx").on(t.cartId),
    productIdx: index("cart_items_product_id_idx").on(t.productId),
    // Optional: prevent duplicate product rows per cart (uncomment if you want 1 row per product)
    // cartProductUnique: uniqueIndex("cart_items_cart_id_product_id_unique").on(t.cartId, t.productId),
  })
);

/**
 * ADMIN_ACTIONS
 */
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

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    adminIdx: index("admin_actions_admin_id_idx").on(t.adminId),
    typeIdx: index("admin_actions_action_type_idx").on(t.actionType),
  })
);

/**
 * ORDER_SUMMARIES (1 per user)
 */
export const orderSummaries = sqliteTable(
  "order_summaries",
  {
    orderSummaryId: text("order_summary_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    totalOrders: integer("total_orders").notNull().default(0),

    // Decimal stored as TEXT e.g. "0.00"
    totalSpent: text("total_spent").notNull().default("0.00"),

    lastOrderDate: text("last_order_date"),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userUnique: uniqueIndex("order_summaries_user_id_unique").on(t.userId),
  })
);

/**
 * PRODUCT_SUMMARIES (1 per product)
 */
export const productSummaries = sqliteTable(
  "product_summaries",
  {
    productSummaryId: text("product_summary_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    productId: text("product_id")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),

    totalSold: integer("total_sold").notNull().default(0),

    totalRevenue: text("total_revenue").notNull().default("0.00"),

    lastSoldDate: text("last_sold_date"),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    productUnique: uniqueIndex("product_summaries_product_id_unique").on(t.productId),
  })
);

/**
 * SELL_SUMMARIES
 */
export const sellSummaries = sqliteTable("sell_summaries", {
  sellSummaryId: text("sell_summary_id")
    .primaryKey()
    .notNull()
    .default(idDefault),

  totalRevenue: text("total_revenue").notNull().default("0.00"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalProductsSold: integer("total_products_sold").notNull().default(0),

  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * SELL_BY_CATEGORIES (1 per category)
 */
export const sellByCategories = sqliteTable(
  "sell_by_categories",
  {
    sellByCategoryId: text("sell_by_category_id")
      .primaryKey()
      .notNull()
      .default(idDefault),

    categoryId: text("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),

    totalRevenue: text("total_revenue").notNull().default("0.00"),
    totalProductsSold: integer("total_products_sold").notNull().default(0),

    lastSoldDate: text("last_sold_date"),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    categoryUnique: uniqueIndex("sell_by_categories_category_id_unique").on(t.categoryId),
  })
);

/**
 * Relations (optional but recommended)
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  adminActions: many(adminActions),
  cart: one(carts, { fields: [users.userId], references: [carts.userId] }),
  orders: many(orders),
  orderSummary: one(orderSummaries, { fields: [users.userId], references: [orderSummaries.userId] }),
  shippingAddresses: many(shippingAddresses),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  productCategories: many(productCategories),
  productSummary: one(productSummaries, { fields: [products.productId], references: [productSummaries.productId] }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  productCategories: many(productCategories),
  sellByCategory: one(sellByCategories, { fields: [categories.categoryId], references: [sellByCategories.categoryId] }),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, { fields: [productCategories.productId], references: [products.productId] }),
  category: one(categories, { fields: [productCategories.categoryId], references: [categories.categoryId] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.userId] }),
  shippingAddress: one(shippingAddresses, {
    fields: [orders.shippingAddressId],
    references: [shippingAddresses.shippingAddressId],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.orderId] }),
  product: one(products, { fields: [orderItems.productId], references: [products.productId] }),
}));

export const cartsRelations = relations(carts, ({ many, one }) => ({
  user: one(users, { fields: [carts.userId], references: [users.userId] }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.cartId] }),
  product: one(products, { fields: [cartItems.productId], references: [products.productId] }),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({ many, one }) => ({
  user: one(users, { fields: [shippingAddresses.userId], references: [users.userId] }),
  orders: many(orders),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(users, { fields: [adminActions.adminId], references: [users.userId] }),
}));

export const orderSummariesRelations = relations(orderSummaries, ({ one }) => ({
  user: one(users, { fields: [orderSummaries.userId], references: [users.userId] }),
}));

export const productSummariesRelations = relations(productSummaries, ({ one }) => ({
  product: one(products, { fields: [productSummaries.productId], references: [products.productId] }),
}));

export const sellByCategoriesRelations = relations(sellByCategories, ({ one }) => ({
  category: one(categories, { fields: [sellByCategories.categoryId], references: [categories.categoryId] }),
}));
