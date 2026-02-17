-- =====================================================
-- E-COMMERCE DATABASE MIGRATION
-- Database: Turso (SQLite)
-- Environments: dev, staging, prod
-- =====================================================

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY NOT NULL,
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Profile
  profile_image_url TEXT,
  date_of_birth TEXT,
  
  -- Verification & Security
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK(email_verified IN (0, 1)),
  phone_verified INTEGER NOT NULL DEFAULT 0 CHECK(phone_verified IN (0, 1)),
  two_factor_enabled INTEGER NOT NULL DEFAULT 0 CHECK(two_factor_enabled IN (0, 1)),
  
  -- Admin & Status
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK(is_admin IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deleted')),
  
  -- Timestamps
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

-- =====================================================
-- ADDRESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS addresses (
  address_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Address Type
  address_type TEXT NOT NULL DEFAULT 'shipping' CHECK(address_type IN ('shipping', 'billing', 'both')),
  
  -- Recipient Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Address Details
  street TEXT NOT NULL,
  street_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  
  -- Default flag
  is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0, 1)),
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);

-- Create index on default addresses
CREATE INDEX IF NOT EXISTS addresses_default_idx ON addresses(user_id, is_default);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  brand TEXT,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array
  
  -- Pricing
  price TEXT NOT NULL,
  original_price TEXT,
  cost_price TEXT,
  
  -- Inventory
  stock INTEGER NOT NULL,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Media
  image_url TEXT,
  images TEXT, -- JSON array
  
  -- Product Details
  weight REAL,
  dimensions TEXT, -- JSON object
  
  -- Ratings & Reviews
  rating REAL,
  review_count INTEGER DEFAULT 0,
  
  -- Seller
  seller_id TEXT,
  
  -- Status & Visibility
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'draft', 'out_of_stock', 'discontinued')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0, 1)),
  
  -- SEO
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Analytics
  views INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create unique index on SKU
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON products(sku);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON products(slug);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- Create index on status and featured for homepage queries
CREATE INDEX IF NOT EXISTS products_status_featured_idx ON products(status, is_featured);

-- Create index on seller for seller products
CREATE INDEX IF NOT EXISTS products_seller_idx ON products(seller_id);

-- Create index on rating for sorting
CREATE INDEX IF NOT EXISTS products_rating_idx ON products(rating DESC);

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  price TEXT NOT NULL, -- Price at time of adding
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  
  -- Ensure one product per user cart
  UNIQUE(user_id, product_id)
);

-- Create index on user_id for cart retrieval
CREATE INDEX IF NOT EXISTS cart_items_user_idx ON cart_items(user_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  
  -- Pricing
  subtotal TEXT NOT NULL,
  tax TEXT NOT NULL,
  shipping TEXT NOT NULL,
  discount TEXT,
  total TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Shipping Address (denormalized for history)
  shipping_address_id TEXT NOT NULL,
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_street TEXT NOT NULL,
  shipping_street_2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  
  -- Billing Address (denormalized for history)
  billing_address_id TEXT NOT NULL,
  billing_first_name TEXT NOT NULL,
  billing_last_name TEXT NOT NULL,
  billing_phone TEXT NOT NULL,
  billing_street TEXT NOT NULL,
  billing_street_2 TEXT,
  billing_city TEXT NOT NULL,
  billing_state TEXT NOT NULL,
  billing_zip_code TEXT NOT NULL,
  billing_country TEXT NOT NULL,
  
  -- Tracking
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT,
  shipped_at TEXT,
  delivered_at TEXT,
  
  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create unique index on order_number
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique ON orders(order_number);

-- Create index on user_id for order history
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Create index on payment_status
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);

-- Create composite index for user orders by date
CREATE INDEX IF NOT EXISTS orders_user_date_idx ON orders(user_id, created_at DESC);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  
  -- Product snapshot (denormalized for history)
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT NOT NULL,
  
  -- Pricing
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  price TEXT NOT NULL, -- Price at time of purchase
  subtotal TEXT NOT NULL, -- quantity * price
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- Create index on order_id for order details
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- Create index on product_id for product sales analytics
CREATE INDEX IF NOT EXISTS order_items_product_idx ON order_items(product_id);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  review_id TEXT PRIMARY KEY NOT NULL,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  order_id TEXT, -- Optional: link to order for verified purchase
  
  -- Review Content
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT, -- JSON array
  
  -- Metadata
  verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN (0, 1)), -- Verified purchase
  helpful INTEGER DEFAULT 0, -- Helpful count
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
  
  -- One review per user per product
  UNIQUE(product_id, user_id)
);

-- Create index on product_id for product reviews
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id);

-- Create index on user_id for user reviews
CREATE INDEX IF NOT EXISTS reviews_user_idx ON reviews(user_id);

-- Create index on rating for filtering
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating DESC);

-- Create index on verified reviews
CREATE INDEX IF NOT EXISTS reviews_verified_idx ON reviews(product_id, verified);

-- =====================================================
-- WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_item_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  
  -- Timestamps
  added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  
  -- Ensure one product per user wishlist
  UNIQUE(user_id, product_id)
);

-- Create index on user_id for wishlist retrieval
CREATE INDEX IF NOT EXISTS wishlist_user_idx ON wishlist(user_id);

-- Create index on product_id for popularity analytics
CREATE INDEX IF NOT EXISTS wishlist_product_idx ON wishlist(product_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Users updated_at trigger
CREATE TRIGGER IF NOT EXISTS users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

-- Addresses updated_at trigger
CREATE TRIGGER IF NOT EXISTS addresses_updated_at
AFTER UPDATE ON addresses
FOR EACH ROW
BEGIN
  UPDATE addresses SET updated_at = CURRENT_TIMESTAMP WHERE address_id = NEW.address_id;
END;

-- Products updated_at trigger
CREATE TRIGGER IF NOT EXISTS products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE product_id = NEW.product_id;
END;

-- Cart items updated_at trigger
CREATE TRIGGER IF NOT EXISTS cart_items_updated_at
AFTER UPDATE ON cart_items
FOR EACH ROW
BEGIN
  UPDATE cart_items SET updated_at = CURRENT_TIMESTAMP WHERE cart_item_id = NEW.cart_item_id;
END;

-- Orders updated_at trigger
CREATE TRIGGER IF NOT EXISTS orders_updated_at
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = NEW.order_id;
END;

-- Reviews updated_at trigger
CREATE TRIGGER IF NOT EXISTS reviews_updated_at
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE review_id = NEW.review_id;
END;

-- =====================================================
-- COMPLETED
-- =====================================================
-- Migration completed successfully
-- Total tables: 8
-- - users
-- - addresses
-- - products
-- - cart_items
-- - orders
-- - order_items
-- - reviews
-- - wishlist
-- =====================================================