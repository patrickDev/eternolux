# Database Schema Quick Reference

## 📊 Tables at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE DATABASE                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │ ← Core user accounts
├──────────────┤
│ • userId (PK)│
│ • email      │
│ • firstName  │
│ • lastName   │
│ • phone      │
│ • isAdmin    │
│ • status     │
└──────┬───────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ├───────────┐                    ┌────────┴────────┐
       │           │                    │                 │
       ▼           ▼                    ▼                 ▼
┌──────────┐  ┌──────────┐      ┌──────────┐     ┌──────────┐
│addresses │  │ products │      │cart_items│     │ wishlist │
├──────────┤  ├──────────┤      ├──────────┤     ├──────────┤
│• addressId  │• productId│      │• cartItem│     │• wishlist│
│• userId(FK)│ │• name     │      │  Id      │     │  ItemId  │
│• type    │  │• sku      │      │• userId  │     │• userId  │
│• street  │  │• price    │      │  (FK)    │     │  (FK)    │
│• city    │  │• stock    │      │• productId     │• productId
│• isDefault  │• sellerId │      │  (FK)    │     │  (FK)    │
└──────────┘  │  (FK→user)│      │• quantity│     │• addedAt │
              └─────┬─────┘      └──────────┘     └──────────┘
                    │
       ┌────────────┼────────────┬────────────┐
       │            │            │            │
       ▼            ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  orders  │  │order_items  │  reviews │  │(products)│
├──────────┤  ├──────────┤  ├──────────┤  │  (above) │
│• orderId │  │• orderItem  │• reviewId│  └──────────┘
│  (PK)    │  │  Id       │  │  (PK)    │
│• userId  │  │• orderId  │  │• productId
│  (FK)    │  │  (FK)     │  │  (FK)    │
│• order   │  │• productId  │• userId  │
│  Number  │  │  (FK)     │  │  (FK)    │
│• subtotal│  │• quantity │  │• orderId │
│• tax     │  │• price    │  │  (FK)    │
│• shipping│  │• subtotal │  │• rating  │
│• total   │  └──────────┘  │• comment │
│• status  │                │• verified│
│• payment │                └──────────┘
│  Status  │
│• shipping│
│  Address │
│• billing │
│  Address │
│• tracking│
└──────────┘
```

## 🔗 Relationship Legend

```
(1) ───< (many)  One-to-many relationship
(FK)             Foreign key
(PK)             Primary key
```

## 📋 Core Relationships

### Users Hub (1 user → many records)
```
users (1)
  ├─< addresses (many)       - Multiple shipping/billing
  ├─< cart_items (many)      - Cart contents
  ├─< orders (many)          - Order history
  ├─< reviews (many)         - Product reviews
  ├─< wishlist (many)        - Saved products
  └─< products (many)        - If seller
```

### Products Hub (1 product → many records)
```
products (1)
  ├─< cart_items (many)      - In many carts
  ├─< order_items (many)     - In many orders
  ├─< reviews (many)         - Product reviews
  └─< wishlist (many)        - In many wishlists
```

### Orders Hub (1 order → many items)
```
orders (1)
  ├─< order_items (many)     - Line items
  └─< reviews (many)         - Item reviews
```

## 📊 Table Sizes (Estimated Growth)

| Table | Growth Rate | Example Count |
|-------|-------------|---------------|
| users | Slow | 10K - 1M |
| addresses | Slow | 20K - 3M (2-3 per user) |
| products | Medium | 1K - 100K |
| cart_items | High | 50K - 500K (temp data) |
| orders | High | 100K - 10M |
| order_items | Very High | 300K - 50M (3-5 per order) |
| reviews | Medium | 10K - 5M (10-20% of orders) |
| wishlist | Medium | 30K - 2M |

## 🎯 Most Common Queries

### 1. Get User Cart (with products)
```
cart_items → JOIN products
WHERE userId = ?
```

### 2. Get Order Details (with items)
```
orders → JOIN order_items → JOIN products
WHERE orderId = ?
```

### 3. Get Product Details (with reviews)
```
products → LEFT JOIN reviews → LEFT JOIN users
WHERE productId = ?
```

### 4. Get User Orders (recent first)
```
orders
WHERE userId = ?
ORDER BY createdAt DESC
```

### 5. Product Search (filtered)
```
products
WHERE category = ? AND status = 'active'
  AND stock > 0
ORDER BY rating DESC
```

## 🗃️ File Structure

```
db/
├── schema/
│   ├── _shared.ts           # Shared utilities (idDefault)
│   ├── users.ts             # Users table
│   ├── addresses.ts         # Addresses table
│   ├── products.ts          # Products table
│   ├── cartItems.ts         # Cart items table
│   ├── orders.ts            # Orders & order items tables
│   ├── reviews.ts           # Reviews table
│   ├── wishlist.ts          # Wishlist table
│   ├── relations.ts         # Drizzle ORM relations
│   └── index.ts             # Barrel export
```

## ✅ Checklist: Migrating to New Schema

- [ ] Backup existing database
- [ ] Drop old tables: `orderSummaries`, `shippingAddresses`
- [ ] Run new migration.sql
- [ ] Update all import statements
- [ ] Update query files to use new table names
- [ ] Test all CRUD operations
- [ ] Verify foreign key constraints
- [ ] Check index performance
- [ ] Update API endpoints
- [ ] Update frontend types (already done ✅)
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production