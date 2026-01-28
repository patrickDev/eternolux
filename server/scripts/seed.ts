import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "../src/db/client"
import {
  users,
  categories,
  products,
  productCategories,
  carts,
  orders,
  orderItems,
  adminActions,
  orderSummaries,
  productSummaries,
  sellByCategories,
  sellSummaries,
} from "../src/db/schema";

/**
 * Ensure IDs exist (SQLite: TEXT PK recommended).
 */
function uuid() {
  return crypto.randomUUID();
}

/**
 * Read JSON array from scripts/data/<file>
 */
async function loadArray<T>(filename: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), "scripts", "data", filename);
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${filename} must export a JSON array`);
  }
  return parsed as T[];
}

/**
 * Insert if not exists, based on a "where" check.
 * This keeps the script safe to re-run.
 */
async function insertIfMissing<TInsert>(
  exists: boolean,
  insertFn: () => Promise<void>
) {
  if (exists) return;
  await insertFn();
}

/**
 * Seed functions per file (dependency order handled by orderedFiles).
 *
 * Important:
 * - Your schema uses money fields as TEXT ("19.99"), not numbers.
 * - status/actionType are TEXT "enums".
 */

// 1) category.json
type CategoryRow = {
  categoryId?: string;
  name: string;
  description?: string | null;
};

async function seedCategories() {
  const rows = await loadArray<CategoryRow>("category.json");

  for (const r of rows) {
    const categoryId = r.categoryId ?? uuid();

    const existing = await db
      .select({ categoryId: categories.categoryId })
      .from(categories)
      .where(eq(categories.name, r.name))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(categories).values({
        categoryId,
        name: r.name,
        description: r.description ?? null,
      });
    });
  }

  console.log(`Seeded categories: ${rows.length}`);
}

// 2) product.json
type ProductRow = {
  productId?: string;
  name: string;
  description?: string | null;
  price: string; // TEXT decimal "7.99"
  stock: number;
  imageUrl?: string | null;
  rating?: number | null;

  /**
   * OPTIONAL:
   * If your product.json also contains categoryIds or categoryNames,
   * support either of these formats:
   */
  categoryIds?: string[];
  categoryNames?: string[];
};

async function seedProducts() {
  const rows = await loadArray<ProductRow>("product.json");

  // Build lookup for category name -> id (if needed)
  const allCats = await db.select().from(categories);
  const categoryIdByName = new Map(allCats.map((c) => [c.name, c.categoryId]));

  for (const r of rows) {
    const productId = r.productId ?? uuid();

    const existing = await db
      .select({ productId: products.productId })
      .from(products)
      .where(eq(products.name, r.name))
      .limit(1);

    let ensuredProductId = productId;

    if (existing.length) {
      ensuredProductId = existing[0].productId;
    } else {
      await db.insert(products).values({
        productId,
        name: r.name,
        description: r.description ?? null,
        price: r.price,
        stock: r.stock,
        imageUrl: r.imageUrl ?? null,
        rating: r.rating ?? null,
      });
    }

    // Optional: seed many-to-many if product.json includes categories
    const idsFromNames =
      (r.categoryNames ?? [])
        .map((n) => categoryIdByName.get(n))
        .filter((x): x is string => Boolean(x)) ?? [];

    const categoryIds = [...(r.categoryIds ?? []), ...idsFromNames];

    for (const categoryId of categoryIds) {
      try {
        await db.insert(productCategories).values({
          productId: ensuredProductId,
          categoryId,
        });
      } catch {
        // ignore duplicates due to composite PK
      }
    }
  }

  console.log(`Seeded products: ${rows.length}`);
}

// 3) user.json
type UserRow = {
  userId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  passwordHash: string;
  isAdmin?: boolean;
};

async function seedUsers() {
  const rows = await loadArray<UserRow>("user.json");

  for (const r of rows) {
    const userId = r.userId ?? uuid();

    const existing = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, r.email))
      .limit(1);

    let ensuredUserId = userId;

    if (existing.length) {
      ensuredUserId = existing[0].userId;
    } else {
      await db.insert(users).values({
        userId,
        firstName: r.firstName,
        lastName: r.lastName,
        phone: r.phone,
        email: r.email,
        passwordHash: r.passwordHash,
        isAdmin: r.isAdmin ?? false,
      });
    }

    // Optional but strongly recommended: ensure each user has a cart + orderSummary
    // Safe to attempt insert; uniqueness prevents duplicates.
    try {
      await db.insert(carts).values({ cartId: uuid(), userId: ensuredUserId });
    } catch {}

    try {
      await db.insert(orderSummaries).values({
        orderSummaryId: uuid(),
        userId: ensuredUserId,
        totalOrders: 0,
        totalSpent: "0.00",
      });
    } catch {}
  }

  console.log(`Seeded users: ${rows.length}`);
}

// 4) order.json
type OrderRow = {
  orderId?: string;
  userId: string;
  shippingAddressId?: string | null;
  status?: string; // "Pending" etc
  totalPrice: string;
};

async function seedOrders() {
  const rows = await loadArray<OrderRow>("order.json");

  for (const r of rows) {
    const orderId = r.orderId ?? uuid();

    const existing = await db
      .select({ orderId: orders.orderId })
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(orders).values({
        orderId,
        userId: r.userId,
        shippingAddressId: r.shippingAddressId ?? null,
        status: (r.status ?? "Pending") as any,
        totalPrice: r.totalPrice,
      });
    });
  }

  console.log(`Seeded orders: ${rows.length}`);
}

// 5) orderItem.json
type OrderItemRow = {
  orderItemId?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
};

async function seedOrderItems() {
  const rows = await loadArray<OrderItemRow>("orderItem.json");

  for (const r of rows) {
    const orderItemId = r.orderItemId ?? uuid();

    const existing = await db
      .select({ orderItemId: orderItems.orderItemId })
      .from(orderItems)
      .where(eq(orderItems.orderItemId, orderItemId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(orderItems).values({
        orderItemId,
        orderId: r.orderId,
        productId: r.productId,
        quantity: r.quantity,
        price: r.price,
      });
    });
  }

  console.log(`Seeded orderItems: ${rows.length}`);
}

// 6) adminAction.json
type AdminActionRow = {
  adminActionId?: string;
  adminId: string;
  actionType: string;
  details?: string | null;
};

async function seedAdminActions() {
  const rows = await loadArray<AdminActionRow>("adminAction.json");

  for (const r of rows) {
    const adminActionId = r.adminActionId ?? uuid();

    const existing = await db
      .select({ adminActionId: adminActions.adminActionId })
      .from(adminActions)
      .where(eq(adminActions.adminActionId, adminActionId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(adminActions).values({
        adminActionId,
        adminId: r.adminId,
        actionType: r.actionType as any,
        details: r.details ?? null,
      });
    });
  }

  console.log(`Seeded adminActions: ${rows.length}`);
}

// 7) orderSummary.json
type OrderSummaryRow = {
  orderSummaryId?: string;
  userId: string;
  totalOrders?: number;
  totalSpent?: string;
  lastOrderDate?: string | null;
};

async function seedOrderSummaries() {
  const rows = await loadArray<OrderSummaryRow>("orderSummary.json");

  for (const r of rows) {
    const orderSummaryId = r.orderSummaryId ?? uuid();

    const existing = await db
      .select({ orderSummaryId: orderSummaries.orderSummaryId })
      .from(orderSummaries)
      .where(eq(orderSummaries.userId, r.userId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(orderSummaries).values({
        orderSummaryId,
        userId: r.userId,
        totalOrders: r.totalOrders ?? 0,
        totalSpent: r.totalSpent ?? "0.00",
        lastOrderDate: r.lastOrderDate ?? null,
      });
    });
  }

  console.log(`Seeded orderSummaries: ${rows.length}`);
}

// 8) productSummary.json
type ProductSummaryRow = {
  productSummaryId?: string;
  productId: string;
  totalSold?: number;
  totalRevenue?: string;
  lastSoldDate?: string | null;
};

async function seedProductSummaries() {
  const rows = await loadArray<ProductSummaryRow>("productSummary.json");

  for (const r of rows) {
    const productSummaryId = r.productSummaryId ?? uuid();

    const existing = await db
      .select({ productSummaryId: productSummaries.productSummaryId })
      .from(productSummaries)
      .where(eq(productSummaries.productId, r.productId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(productSummaries).values({
        productSummaryId,
        productId: r.productId,
        totalSold: r.totalSold ?? 0,
        totalRevenue: r.totalRevenue ?? "0.00",
        lastSoldDate: r.lastSoldDate ?? null,
      });
    });
  }

  console.log(`Seeded productSummaries: ${rows.length}`);
}

// 9) sellByCategory.json
type SellByCategoryRow = {
  sellByCategoryId?: string;
  categoryId: string;
  totalRevenue?: string;
  totalProductsSold?: number;
  lastSoldDate?: string | null;
};

async function seedSellByCategory() {
  const rows = await loadArray<SellByCategoryRow>("sellByCategory.json");

  for (const r of rows) {
    const sellByCategoryId = r.sellByCategoryId ?? uuid();

    const existing = await db
      .select({ sellByCategoryId: sellByCategories.sellByCategoryId })
      .from(sellByCategories)
      .where(eq(sellByCategories.categoryId, r.categoryId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(sellByCategories).values({
        sellByCategoryId,
        categoryId: r.categoryId,
        totalRevenue: r.totalRevenue ?? "0.00",
        totalProductsSold: r.totalProductsSold ?? 0,
        lastSoldDate: r.lastSoldDate ?? null,
      });
    });
  }

  console.log(`Seeded sellByCategories: ${rows.length}`);
}

// 10) sellSummary.json
type SellSummaryRow = {
  sellSummaryId?: string;
  totalRevenue?: string;
  totalOrders?: number;
  totalProductsSold?: number;
  startDate: string;
  endDate: string;
};

async function seedSellSummaries() {
  const rows = await loadArray<SellSummaryRow>("sellSummary.json");

  for (const r of rows) {
    const sellSummaryId = r.sellSummaryId ?? uuid();

    const existing = await db
      .select({ sellSummaryId: sellSummaries.sellSummaryId })
      .from(sellSummaries)
      .where(eq(sellSummaries.sellSummaryId, sellSummaryId))
      .limit(1);

    await insertIfMissing(existing.length > 0, async () => {
      await db.insert(sellSummaries).values({
        sellSummaryId,
        totalRevenue: r.totalRevenue ?? "0.00",
        totalOrders: r.totalOrders ?? 0,
        totalProductsSold: r.totalProductsSold ?? 0,
        startDate: r.startDate,
        endDate: r.endDate,
      });
    });
  }

  console.log(`Seeded sellSummaries: ${rows.length}`);
}

const orderedFiles = [
  "category.json",
  "product.json",
  "user.json",
  "order.json",
  "orderItem.json",
  "adminAction.json",
  "orderSummary.json",
  "productSummary.json",
  "sellByCategory.json",
  "sellSummary.json",
] as const;

async function main() {
  console.log("Seeding started...");

  // Seed in the order you provided
  for (const file of orderedFiles) {
    switch (file) {
      case "category.json":
        await seedCategories();
        break;
      case "product.json":
        await seedProducts();
        break;
      case "user.json":
        await seedUsers();
        break;
      case "order.json":
        await seedOrders();
        break;
      case "orderItem.json":
        await seedOrderItems();
        break;
      case "adminAction.json":
        await seedAdminActions();
        break;
      case "orderSummary.json":
        await seedOrderSummaries();
        break;
      case "productSummary.json":
        await seedProductSummaries();
        break;
      case "sellByCategory.json":
        await seedSellByCategory();
        break;
      case "sellSummary.json":
        await seedSellSummaries();
        break;
      default:
        throw new Error(`Unknown seed file: ${file}`);
    }
  }

  console.log("Seeding finished successfully.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
