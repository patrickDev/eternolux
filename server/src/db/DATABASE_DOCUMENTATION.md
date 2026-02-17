# E-Commerce Database Schema Documentation

## 📊 Database Overview

This schema supports a complete e-commerce platform with user management, product catalog, shopping cart, orders, reviews, and wishlists.

## 🗂️ Tables Summary

| Table | Purpose | Records |
|-------|---------|---------|
| **users** | User accounts & authentication | One per user |
| **addresses** | Shipping & billing addresses | Many per user |
| **products** | Product catalog | One per product |
| **cart_items** | Shopping cart contents | Many per user |
| **orders** | Order headers | Many per user |
| **order_items** | Order line items | Many per order |
| **reviews** | Product reviews | One per user per product |
| **wishlist** | User wishlists | Many per user |

## 🔗 Relationships Detailed

### Users (1:many relationships)
```
users
  ├── addresses (1:many) - User can have multiple shipping/billing addresses
  ├── cart_items (1:many) - User has one cart with multiple items
  ├── orders (1:many) - User can place multiple orders
  ├── reviews (1:many) - User can write multiple reviews
  ├── wishlist (1:many) - User can wishlist multiple products
  └── products (1:many as seller) - If user is a seller, can have multiple products
```

### Products (1:many relationships)
```
products
  ├── cart_items (1:many) - Product can be in many carts
  ├── order_items (1:many) - Product can be in many orders
  ├── reviews (1:many) - Product can have many reviews
  ├── wishlist (1:many) - Product can be in many wishlists
  └── seller (many:1) - Product belongs to one seller (user)
```

### Orders (1:many relationships)
```
orders
  ├── order_items (1:many) - Order contains multiple line items
  ├── reviews (1:many) - Order can have reviews for purchased items
  └── user (many:1) - Order belongs to one user
```

## 📋 Table Definitions

### 1. users
**Purpose**: Core user accounts and authentication

**Key Fields**:
- `userId` (PK) - Unique user identifier
- `email` (Unique) - User email address
- `firstName`, `lastName` - User name
- `phone` - Contact number
- `passwordHash` - Encrypted password
- `emailVerified`, `phoneVerified` - Verification status
- `twoFactorEnabled` - 2FA security
- `isAdmin` - Admin privileges
- `status` - active | suspended | deleted

**Relationships**:
- 1:many with addresses
- 1:many with cart_items
- 1:many with orders
- 1:many with reviews
- 1:many with wishlist
- 1:many with products (as seller)

---

### 2. addresses
**Purpose**: Store shipping and billing addresses

**Key Fields**:
- `addressId` (PK) - Unique address identifier
- `userId` (FK) - References users
- `addressType` - shipping | billing | both
- `firstName`, `lastName`, `phone` - Recipient info
- `street`, `street2`, `city`, `state`, `zipCode`, `country` - Full address
- `isDefault` - Mark as default address

**Relationships**:
- many:1 with users

**Why Separate Table?**:
- Users need multiple addresses (home, work, gift recipients)
- Different shipping vs billing addresses
- Address history preservation

---

### 3. products
**Purpose**: Product catalog with inventory and pricing

**Key Fields**:
- `productId` (PK) - Unique product identifier
- `sku` (Unique) - Stock Keeping Unit
- `name`, `description` - Product info
- `brand`, `category`, `tags` - Organization
- `price`, `originalPrice`, `costPrice` - Pricing tiers
- `stock`, `lowStockThreshold` - Inventory management
- `imageUrl`, `images` - Product photos
- `rating`, `reviewCount` - Aggregated review data
- `sellerId` (FK) - References users (if marketplace)
- `status` - active | draft | out_of_stock | discontinued
- `isFeatured` - Homepage feature flag
- `slug` - SEO-friendly URL
- `views`, `purchases` - Analytics

**Relationships**:
- many:1 with users (as seller)
- 1:many with cart_items
- 1:many with order_items
- 1:many with reviews
- 1:many with wishlist

**Design Decisions**:
- Denormalized `rating` and `reviewCount` for performance
- Separate `originalPrice` to show discounts
- `slug` for SEO-friendly URLs
- `tags` as JSON for flexible categorization

---

### 4. cart_items
**Purpose**: Shopping cart contents

**Key Fields**:
- `cartItemId` (PK) - Unique cart item identifier
- `userId` (FK) - References users
- `productId` (FK) - References products
- `quantity` - Number of items
- `price` - Price snapshot when added

**Relationships**:
- many:1 with users
- many:1 with products

**Design Decisions**:
- Store `price` at time of adding (price may change later)
- Unique constraint on (userId, productId) - one entry per product per user
- Easy to calculate cart total: SUM(quantity * price)

**Cart Cleanup Strategy**:
- Option 1: Delete after order placement
- Option 2: Keep for analytics (add `checked_out` flag)
- Option 3: TTL - auto-delete after 30 days

---

### 5. orders
**Purpose**: Order header information

**Key Fields**:
- `orderId` (PK) - Unique order identifier
- `userId` (FK) - References users
- `orderNumber` (Unique) - Human-readable order number (e.g., "ORD-2024-001")
- `subtotal`, `tax`, `shipping`, `discount`, `total` - Pricing breakdown
- `status` - pending | processing | shipped | delivered | cancelled | refunded
- `paymentStatus` - pending | paid | failed | refunded

**Denormalized Address Fields**:
- Shipping: `shippingAddressId`, `shippingFirstName`, `shippingLastName`, etc.
- Billing: `billingAddressId`, `billingFirstName`, `billingLastName`, etc.

**Tracking**:
- `trackingNumber`, `carrier`, `estimatedDelivery`

**Timestamps**:
- `createdAt`, `updatedAt`, `paidAt`, `shippedAt`, `deliveredAt`

**Relationships**:
- many:1 with users
- 1:many with order_items
- 1:many with reviews

**Design Decisions**:
- **Denormalized addresses** - Preserves order history even if user deletes/changes address
- Separate `subtotal` and `total` for transparency
- Multiple status fields for order lifecycle tracking
- `orderNumber` for customer-facing reference

---

### 6. order_items
**Purpose**: Individual line items in an order

**Key Fields**:
- `orderItemId` (PK) - Unique order item identifier
- `orderId` (FK) - References orders
- `productId` (FK) - References products (set null if product deleted)

**Denormalized Product Fields**:
- `productName`, `productImage`, `productSku` - Product snapshot

**Pricing**:
- `quantity`, `price`, `subtotal`

**Relationships**:
- many:1 with orders
- many:1 with products

**Design Decisions**:
- **Denormalized product info** - Preserves order history if product changes/deleted
- Store `price` at time of purchase (not current product price)
- `productId` set null on delete (keep order history intact)

---

### 7. reviews
**Purpose**: Product reviews and ratings

**Key Fields**:
- `reviewId` (PK) - Unique review identifier
- `productId` (FK) - References products
- `userId` (FK) - References users
- `orderId` (FK, optional) - References orders (for verified purchases)
- `rating` - 1-5 stars
- `title`, `comment` - Review content
- `images` - Review photos
- `verified` - Verified purchase badge
- `helpful` - Helpful vote count

**Relationships**:
- many:1 with products
- many:1 with users
- many:1 with orders (optional)

**Design Decisions**:
- Unique constraint on (productId, userId) - one review per user per product
- Optional `orderId` link enables "Verified Purchase" badge
- `helpful` count for social proof
- Update product's `rating` and `reviewCount` via trigger or app logic

---

### 8. wishlist
**Purpose**: User product wishlists

**Key Fields**:
- `wishlistItemId` (PK) - Unique wishlist item identifier
- `userId` (FK) - References users
- `productId` (FK) - References products
- `addedAt` - When item was added

**Relationships**:
- many:1 with users
- many:1 with products

**Design Decisions**:
- Unique constraint on (userId, productId) - can't wishlist same product twice
- Simple design for flexible wishlist features
- Track `addedAt` for "Recently Added" sorting

---

## 🔑 Primary Keys & Indexes

### Primary Keys
All tables use custom text-based IDs (e.g., `user-001`, `prod-001`) via `idDefault` function.

**Advantages**:
- ✅ More readable in URLs and logs
- ✅ No sequential ID leakage
- ✅ Can include table prefix for clarity
- ✅ Compatible with distributed systems

### Indexes Strategy

**users**:
- `email` (unique) - Login queries
- `status` - Filter active users

**addresses**:
- `userId` - User's addresses lookup
- `(userId, isDefault)` - Fast default address lookup

**products**:
- `sku` (unique) - SKU lookups
- `slug` (unique) - SEO URL lookups
- `category` - Category filtering
- `(status, isFeatured)` - Homepage queries
- `sellerId` - Seller's products
- `rating` - Sort by rating

**cart_items**:
- `userId` - User's cart lookup
- `(userId, productId)` - Prevent duplicates

**orders**:
- `orderNumber` (unique) - Order lookup
- `userId` - User's order history
- `status` - Filter by status
- `paymentStatus` - Payment tracking
- `(userId, createdAt)` - Sort user orders

**order_items**:
- `orderId` - Order's items lookup
- `productId` - Product sales analytics

**reviews**:
- `productId` - Product's reviews
- `userId` - User's reviews
- `rating` - Sort by rating
- `(productId, verified)` - Verified reviews
- `(productId, userId)` - Prevent duplicate reviews

**wishlist**:
- `userId` - User's wishlist
- `productId` - Product popularity
- `(userId, productId)` - Prevent duplicates

---

## 🎯 Data Integrity

### Foreign Key Cascades

**ON DELETE CASCADE** (delete children):
- users → addresses, cart_items, orders, reviews, wishlist
- orders → order_items
- products → cart_items, reviews, wishlist

**ON DELETE SET NULL** (keep record, remove reference):
- products → order_items (preserve order history)
- users → products (seller deleted, product remains)
- orders → reviews (order deleted, review remains)

### Constraints

**Unique Constraints**:
- users.email
- products.sku
- products.slug
- orders.orderNumber
- (cart_items: userId + productId)
- (reviews: productId + userId)
- (wishlist: userId + productId)

**Check Constraints**:
- users.status IN ('active', 'suspended', 'deleted')
- addresses.addressType IN ('shipping', 'billing', 'both')
- products.status IN ('active', 'draft', 'out_of_stock', 'discontinued')
- orders.status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- orders.paymentStatus IN ('pending', 'paid', 'failed', 'refunded')
- reviews.rating BETWEEN 1 AND 5

---

## 🚀 Query Patterns

### Common Queries

**Get User's Cart with Products**:
```sql
SELECT c.*, p.* FROM cart_items c
JOIN products p ON c.product_id = p.product_id
WHERE c.user_id = ?
```

**Get Order with Items**:
```sql
SELECT o.*, oi.*, p.* FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_id = ?
```

**Get Product with Reviews**:
```sql
SELECT p.*, r.*, u.first_name, u.last_name FROM products p
LEFT JOIN reviews r ON p.product_id = r.product_id
LEFT JOIN users u ON r.user_id = u.user_id
WHERE p.product_id = ?
ORDER BY r.created_at DESC
```

**Get User's Order History**:
```sql
SELECT * FROM orders
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 10
```

---

## 📈 Scalability Considerations

### Denormalization
- **Orders**: Store address snapshots (don't reference addresses table)
- **Order Items**: Store product snapshots (name, image, SKU)
- **Products**: Store aggregated rating/review count

**Why?**: Preserves historical accuracy even if data changes/deletes

### Performance Optimization
- Index foreign keys for JOIN queries
- Composite indexes for common filter combinations
- Store calculated values (cart total, order total) in app layer
- Consider materialized views for analytics

### Future Enhancements
- **Coupons/Promotions** - Add `coupons` table and `order_coupons` junction
- **Payment Methods** - Add `payment_methods` table
- **Order Tracking** - Add `order_status_history` table
- **Product Variants** - Add `product_variants` table (size, color, etc.)
- **Inventory Logs** - Add `inventory_transactions` table
- **Notifications** - Add `notifications` table
- **Abandoned Carts** - Track via `cart_items` timestamps

---

## ✅ Tables to DELETE from Your Current Schema

Based on this new schema, you should **DELETE** these tables:

1. ❌ **orderSummaries** - Compute on-demand from orders table
2. ❌ **shippingAddresses** - Replaced by unified `addresses` table

Keep only the 8 tables listed in this document.
