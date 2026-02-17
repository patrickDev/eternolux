// db/schema/relations.ts
import { relations } from "drizzle-orm";
import { users } from "./users";
import { addresses } from "./addresses";
import { products } from "./products";
import { cartItems } from "./cartItems";
import { orders, orderItems } from "./orders";
import { reviews } from "./reviews";
import { wishlist } from "./wishlist";
import { sessions } from "./sessions";

// User Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  cartItems: many(cartItems),
  orders: many(orders),
  reviews: many(reviews),
  wishlistItems: many(wishlist),
  productsAsSeller: many(products, { relationName: "seller" }),
}));

// Address Relations
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.userId],
  }),
}));

// Product Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.userId],
    relationName: "seller",
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlistItems: many(wishlist),
}));

// Cart Item Relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.userId],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.productId],
  }),
}));

// Order Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.userId],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

// Order Item Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.orderId],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.productId],
  }),
}));

// Review Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.productId],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.userId],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.orderId],
  }),
}));

// Wishlist Relations
export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.userId],
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.productId],
  }),
}));

//session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.userId],
  }),
}));