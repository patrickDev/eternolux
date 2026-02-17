# Implementation Guide

## 📦 What You Received

### Schema Files (TypeScript/Drizzle ORM)
1. **users.ts** - User accounts table
2. **addresses.ts** - Shipping & billing addresses
3. **products.ts** - Product catalog
4. **cartItems.ts** - Shopping cart
5. **orders.ts** - Orders & order items tables
6. **reviews.ts** - Product reviews
7. **wishlist.ts** - User wishlists
8. **relations.ts** - Drizzle ORM relationships
9. **index.ts** - Barrel export file

### Documentation
- **DATABASE_DOCUMENTATION.md** - Complete schema documentation
- **QUICK_REFERENCE.md** - Visual diagrams and quick reference

## 🚀 Step-by-Step Implementation

### Step 1: Clean Up Old Schema

Delete these old tables from your schema:
```bash
# Remove these files:
rm db/schema/orderSummaries.ts
rm db/schema/shippingAddresses.ts  # Replaced by addresses.ts
```

### Step 2: Add New Schema Files

Place the provided TypeScript files in your schema directory:
```
your-project/
├── db/
│   ├── schema/
│   │   ├── _shared.ts           # Keep your existing one
│   │   ├── users.ts             # ← NEW (replace old)
│   │   ├── addresses.ts         # ← NEW
│   │   ├── products.ts          # ← NEW (replace old)
│   │   ├── cartItems.ts         # ← NEW
│   │   ├── orders.ts            # ← NEW (replace old)
│   │   ├── reviews.ts           # ← NEW
│   │   ├── wishlist.ts          # ← NEW
│   │   ├── relations.ts         # ← NEW
│   │   └── index.ts             # ← NEW (replace old)
```

### Step 3: Update Database

#### Option A: Fresh Migration (Recommended for Dev)

```bash
# Backup first!
turso db dump ecommerce-dev > backup.sql

# Drop all tables
turso db shell ecommerce-dev < rollback.sql

# Create new schema
turso db shell ecommerce-dev < migration.sql

# Add test data
turso db shell ecommerce-dev < seed.sql
```

#### Option B: Migration Scripts (For Production)

Create migration scripts to transform existing data:

```typescript
// migrations/001_update_schema.ts
import { db } from '@/lib/db';

export async function up() {
  // 1. Create new tables
  await db.execute(sql`CREATE TABLE addresses ...`);
  await db.execute(sql`CREATE TABLE reviews ...`);
  await db.execute(sql`CREATE TABLE wishlist ...`);
  
  // 2. Migrate data from shippingAddresses to addresses
  await db.execute(sql`
    INSERT INTO addresses (address_id, user_id, address_type, ...)
    SELECT shipping_address_id, user_id, 'shipping', ...
    FROM shippingAddresses
  `);
  
  // 3. Drop old tables
  await db.execute(sql`DROP TABLE orderSummaries`);
  await db.execute(sql`DROP TABLE shippingAddresses`);
}
```

### Step 4: Update Import Statements

Update all your query files:

**Before:**
```typescript
import { users } from "@/db/schema/users";
import { shippingAddresses } from "@/db/schema/shippingAddresses";
import { orderSummaries } from "@/db/schema/orderSummaries";
```

**After:**
```typescript
import { users, addresses, products, orders, orderItems, cartItems, reviews, wishlist } from "@/db/schema";
```

### Step 5: Update Queries

#### Example: Get User Cart

**Before:**
```typescript
const cart = await db.query.cartItems.findMany({
  where: eq(cartItems.userId, userId),
});
```

**After (with relations):**
```typescript
const cart = await db.query.cartItems.findMany({
  where: eq(cartItems.userId, userId),
  with: {
    product: true,  // Automatically joins products
  },
});
```

#### Example: Get Order with Items

**After:**
```typescript
const order = await db.query.orders.findFirst({
  where: eq(orders.orderId, orderId),
  with: {
    orderItems: {
      with: {
        product: true,
      },
    },
  },
});
```

### Step 6: Update API Endpoints

#### Cart Endpoints

```typescript
// POST /api/cart
export async function addToCart(userId: string, productId: string, quantity: number) {
  const product = await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });
  
  return db.insert(cartItems).values({
    userId,
    productId,
    quantity,
    price: product.price, // Snapshot price
  });
}

// GET /api/cart
export async function getCart(userId: string) {
  return db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: { product: true },
  });
}
```

#### Order Endpoints

```typescript
// POST /api/orders
export async function createOrder(userId: string, data: CreateOrderData) {
  // 1. Create order
  const order = await db.insert(orders).values({
    userId,
    orderNumber: generateOrderNumber(),
    subtotal: data.subtotal,
    tax: data.tax,
    shipping: data.shipping,
    total: data.total,
    // Denormalize addresses
    shippingFirstName: data.shippingAddress.firstName,
    shippingLastName: data.shippingAddress.lastName,
    // ... etc
  }).returning();
  
  // 2. Create order items from cart
  const cartData = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: { product: true },
  });
  
  await db.insert(orderItems).values(
    cartData.map(item => ({
      orderId: order[0].orderId,
      productId: item.productId,
      // Denormalize product info
      productName: item.product.name,
      productImage: item.product.imageUrl,
      productSku: item.product.sku,
      quantity: item.quantity,
      price: item.price,
      subtotal: (item.quantity * parseFloat(item.price)).toFixed(2),
    }))
  );
  
  // 3. Clear cart
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  
  return order[0];
}
```

### Step 7: Test Everything

```bash
# Run your test suite
npm test

# Test API endpoints
curl http://localhost:3000/api/cart
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/products
```

## 🔍 Common Queries Reference

### Get User with Addresses
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.userId, userId),
  with: {
    addresses: true,
  },
});
```

### Get Product with Reviews
```typescript
const product = await db.query.products.findFirst({
  where: eq(products.productId, productId),
  with: {
    reviews: {
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    },
  },
});
```

### Search Products
```typescript
const products = await db.query.products.findMany({
  where: and(
    eq(products.category, 'Electronics'),
    eq(products.status, 'active'),
    gt(products.stock, 0)
  ),
  orderBy: (products, { desc }) => [desc(products.rating)],
  limit: 20,
});
```

### Get User Order History
```typescript
const orders = await db.query.orders.findMany({
  where: eq(orders.userId, userId),
  with: {
    orderItems: {
      with: {
        product: true,
      },
    },
  },
  orderBy: (orders, { desc }) => [desc(orders.createdAt)],
});
```

## 📊 Key Differences from Old Schema

### 1. Unified Addresses Table
**Before:** `shippingAddresses` (shipping only)
**After:** `addresses` (shipping, billing, or both)

**Migration:**
```typescript
// All shippingAddresses become addresses with type='shipping'
INSERT INTO addresses (address_id, user_id, address_type, ...)
SELECT shipping_address_id, user_id, 'shipping', ...
FROM shippingAddresses;
```

### 2. No More orderSummaries
**Before:** Separate table with aggregated data
**After:** Compute on-demand

**Migration:**
```typescript
// Delete the table, compute when needed
export async function getUserOrderSummary(userId: string) {
  const result = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalSpent: sql<string>`SUM(CAST(${orders.total} AS REAL))`,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .get();
  
  return result;
}
```

### 3. Denormalized Order Data
**Before:** Orders referenced addresses and products
**After:** Orders store snapshot of addresses and products

**Why?** Preserves order history even if addresses/products change

### 4. Separate order_items Table
**Before:** Order items might have been inline or in separate table
**After:** Definitely separate with denormalized product info

## ⚠️ Breaking Changes Checklist

- [ ] Update all imports to use new table names
- [ ] Replace `shippingAddresses` with `addresses`
- [ ] Remove `orderSummaries` queries, compute instead
- [ ] Update order creation to denormalize addresses
- [ ] Update order items to denormalize product info
- [ ] Add reviews feature to product pages
- [ ] Add wishlist feature to frontend
- [ ] Test all CRUD operations
- [ ] Update API documentation

## 🎯 Next Steps

1. ✅ Implement schema in dev environment
2. ✅ Write integration tests
3. ✅ Test all API endpoints
4. ✅ Update frontend to use new types
5. ✅ Deploy to staging
6. ✅ QA testing
7. ✅ Create production migration plan
8. ✅ Deploy to production

## 📚 Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team
- **Turso Docs**: https://docs.turso.tech
- **Your Migration Files**: migration.sql, seed.sql, rollback.sql
- **Your Frontend Types**: Already aligned! ✅

Good luck with the implementation! 🚀
