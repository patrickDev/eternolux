# Quick Migration Commands - Copy & Paste

## 🚀 One-Line Setup

```bash
mkdir -p migrations && cp migration.sql sessions_migration.sql seed.sql rollback.sql migrations/ && turso db shell eternolux-dev < migrations/migration.sql && turso db shell eternolux-dev < migrations/sessions_migration.sql && echo "✅ Database ready!"
```

---

## 📋 Step-by-Step Commands

### 1. Copy Files
```bash
mkdir -p migrations
cp migration.sql migrations/
cp sessions_migration.sql migrations/
cp seed.sql migrations/
cp rollback.sql migrations/
```

### 2. Create Tables
```bash
# Main tables (users, products, orders, etc.)
turso db shell eternolux-dev < migrations/migration.sql

# Sessions table (for auth)
turso db shell eternolux-dev < migrations/sessions_migration.sql
```

### 3. Add Test Data (Optional)
```bash
turso db shell eternolux-dev < migrations/seed.sql
```

### 4. Verify
```bash
turso db shell eternolux-dev ".tables"
```

**Expected output:**
```
addresses    cart_items   order_items  orders       
products     reviews      sessions     users        
wishlist
```

---

## 🔄 Reset Database

```bash
# Drop all tables
turso db shell eternolux-dev < migrations/rollback.sql

# Recreate
turso db shell eternolux-dev < migrations/migration.sql
turso db shell eternolux-dev < migrations/sessions_migration.sql
```

---

## ✅ You Have 4 Files

1. **migration.sql** - Creates 8 tables
2. **sessions_migration.sql** - Creates sessions table
3. **seed.sql** - Adds test data
4. **rollback.sql** - Drops all tables

---

**Just run these commands and your database is ready!** 🎉