# Migration Files - Complete Guide

## 📦 4 Migration Files Provided

1. **migration.sql** - Main schema (8 tables)
2. **sessions_migration.sql** - Sessions table for auth
3. **seed.sql** - Sample test data
4. **rollback.sql** - Undo all migrations

---

## 🚀 Quick Setup

### Step 1: Copy Files to Your Project
```bash
# Create migrations folder
mkdir -p migrations

# Copy all migration files
cp migration.sql migrations/
cp sessions_migration.sql migrations/
cp seed.sql migrations/
cp rollback.sql migrations/
```

### Step 2: Run Migrations
```bash
# Create all tables (8 tables)
turso db shell eternolux-dev < migrations/migration.sql

# Add sessions table
turso db shell eternolux-dev < migrations/sessions_migration.sql

# (Optional) Add test data
turso db shell eternolux-dev < migrations/seed.sql
```

---

## 📋 What Each File Does

### 1. migration.sql (Main Schema)
Creates **8 tables**:
- ✅ `users` - User accounts
- ✅ `addresses` - User addresses
- ✅ `products` - Product catalog
- ✅ `cart_items` - Shopping cart
- ✅ `orders` - Orders
- ✅ `order_items` - Order line items
- ✅ `reviews` - Product reviews
- ✅ `wishlist` - User wishlists

**Command**:
```bash
turso db shell eternolux-dev < migrations/migration.sql
```

---

### 2. sessions_migration.sql (Auth Sessions)
Creates **1 table**:
- ✅ `sessions` - Authentication sessions

**Command**:
```bash
turso db shell eternolux-dev < migrations/sessions_migration.sql
```

---

### 3. seed.sql (Test Data)
Inserts sample data:
- ✅ 2 test users (admin + regular user)
- ✅ 10+ sample products
- ✅ Sample addresses
- ✅ Sample reviews

**Command**:
```bash
turso db shell eternolux-dev < migrations/seed.sql
```

**Test credentials**:
- Admin: `admin@eternolux.com` / password: `AdminPass123`
- User: `john.doe@example.com` / password: `UserPass123`

---

### 4. rollback.sql (Undo Migrations)
Drops all tables (for fresh start)

**Command**:
```bash
turso db shell eternolux-dev < migrations/rollback.sql
```

⚠️ **Warning**: This deletes ALL data!

---

## ✅ Complete Setup Workflow

```bash
# 1. Create migrations folder
mkdir -p migrations

# 2. Copy files
cp migration.sql sessions_migration.sql seed.sql rollback.sql migrations/

# 3. Run main migration
turso db shell eternolux-dev < migrations/migration.sql

# 4. Add sessions
turso db shell eternolux-dev < migrations/sessions_migration.sql

# 5. Add test data (optional)
turso db shell eternolux-dev < migrations/seed.sql

# 6. Verify tables created
turso db shell eternolux-dev ".tables"
```

**Expected output**:
```
addresses        orders           reviews          
cart_items       order_items      sessions         
products         users            wishlist
```

---

## 🧪 Test the Database

```bash
# Connect to database
turso db shell eternolux-dev

# List all tables
.tables

# Check users table
SELECT * FROM users;

# Check products
SELECT product_id, name, price FROM products LIMIT 5;

# Exit
.quit
```

---

## 🔄 Reset Database (Fresh Start)

If you need to start over:

```bash
# 1. Drop all tables
turso db shell eternolux-dev < migrations/rollback.sql

# 2. Recreate tables
turso db shell eternolux-dev < migrations/migration.sql
turso db shell eternolux-dev < migrations/sessions_migration.sql

# 3. Add test data
turso db shell eternolux-dev < migrations/seed.sql
```

---

## 📊 Database Schema Summary

After running migrations, you'll have **9 tables** with **all relationships**:

```
users (1) ─────< addresses (many)
users (1) ─────< cart_items (many)
users (1) ─────< orders (many)
users (1) ─────< reviews (many)
users (1) ─────< wishlist (many)
users (1) ─────< sessions (many)

products (1) ──< cart_items (many)
products (1) ──< order_items (many)
products (1) ──< reviews (many)
products (1) ──< wishlist (many)

orders (1) ────< order_items (many)
```

---

## 🎯 Next Steps

After migrations:

1. ✅ Update `.dev.vars` with database URL
2. ✅ Test backend with `npm run dev`
3. ✅ Test registration endpoint
4. ✅ Test login endpoint
5. ✅ Deploy to Cloudflare

---

## 🔧 Troubleshooting

### Error: "database not found"
```bash
# Create database first
turso db create eternolux-dev
```

### Error: "table already exists"
```bash
# Tables already created, skip migration or rollback first
turso db shell eternolux-dev < migrations/rollback.sql
```

### Want to see what's inside a migration?
```bash
cat migrations/migration.sql
```

### Check if migrations ran successfully
```bash
turso db shell eternolux-dev "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📝 Migration Files Location

```
your-project/
└── migrations/
    ├── migration.sql           ✅ Main schema (8 tables)
    ├── sessions_migration.sql  ✅ Sessions table
    ├── seed.sql                ✅ Test data
    └── rollback.sql            ✅ Drop all tables
```

---

**All files are ready in your outputs folder!** Just copy and run. 🚀