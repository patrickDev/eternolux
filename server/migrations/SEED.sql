-- =====================================================
-- SEED DATA FOR TESTING
-- Run this after migration.sql to populate test data
-- =====================================================

-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (user_id, first_name, last_name, phone, email, password_hash, email_verified, is_admin, status) VALUES
('user-001', 'John', 'Doe', '+1-555-0101', 'john.doe@example.com', '$2b$10$hashedpassword1', 1, 0, 'active'),
('user-002', 'Jane', 'Smith', '+1-555-0102', 'jane.smith@example.com', '$2b$10$hashedpassword2', 1, 0, 'active'),
('user-003', 'Admin', 'User', '+1-555-0103', 'admin@example.com', '$2b$10$hashedpassword3', 1, 1, 'active'),
('user-004', 'Bob', 'Johnson', '+1-555-0104', 'bob.johnson@example.com', '$2b$10$hashedpassword4', 0, 0, 'active'),
('seller-001', 'Alice', 'Merchant', '+1-555-0201', 'alice.seller@example.com', '$2b$10$hashedpassword5', 1, 0, 'active');

-- =====================================================
-- ADDRESSES
-- =====================================================
INSERT INTO addresses (address_id, user_id, address_type, first_name, last_name, phone, street, city, state, zip_code, country, is_default) VALUES
-- John's addresses
('addr-001', 'user-001', 'both', 'John', 'Doe', '+1-555-0101', '123 Main Street', 'San Francisco', 'CA', '94102', 'US', 1),
('addr-002', 'user-001', 'shipping', 'John', 'Doe', '+1-555-0101', '456 Work Ave', 'San Francisco', 'CA', '94103', 'US', 0),

-- Jane's addresses
('addr-003', 'user-002', 'shipping', 'Jane', 'Smith', '+1-555-0102', '789 Oak Street', 'Los Angeles', 'CA', '90001', 'US', 1),
('addr-004', 'user-002', 'billing', 'Jane', 'Smith', '+1-555-0102', '321 Elm Street', 'Los Angeles', 'CA', '90002', 'US', 1),

-- Bob's address
('addr-005', 'user-004', 'both', 'Bob', 'Johnson', '+1-555-0104', '555 Pine Road', 'Seattle', 'WA', '98101', 'US', 1);

-- =====================================================
-- PRODUCTS
-- =====================================================
INSERT INTO products (product_id, name, description, sku, brand, category, tags, price, original_price, stock, image_url, images, rating, review_count, seller_id, status, is_featured, slug) VALUES
-- Electronics
('prod-001', 'Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30-hour battery life', 'WBH-001', 'AudioTech', 'Electronics', '["wireless","bluetooth","noise-cancelling"]', '199.99', '249.99', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e","https://images.unsplash.com/photo-1484704849700-f032a568e944"]', 4.5, 128, 'seller-001', 'active', 1, 'wireless-bluetooth-headphones'),

('prod-002', 'Smart Watch Pro', 'Advanced fitness tracking with heart rate monitor and GPS', 'SWP-002', 'TechWear', 'Electronics', '["smartwatch","fitness","gps"]', '299.99', '349.99', 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', '["https://images.unsplash.com/photo-1523275335684-37898b6baf30"]', 4.7, 89, 'seller-001', 'active', 1, 'smart-watch-pro'),

('prod-003', '4K Ultra HD Webcam', 'Professional webcam with auto-focus and dual microphones', 'UHD-003', 'StreamCam', 'Electronics', '["webcam","4k","streaming"]', '149.99', NULL, 75, 'https://images.unsplash.com/photo-1570209306599-e99196ac8e45', '["https://images.unsplash.com/photo-1570209306599-e99196ac8e45"]', 4.3, 45, 'seller-001', 'active', 0, '4k-ultra-hd-webcam'),

-- Clothing
('prod-004', 'Premium Cotton T-Shirt', 'Soft, comfortable 100% organic cotton t-shirt', 'PCT-004', 'EcoWear', 'Clothing', '["organic","cotton","casual"]', '29.99', '39.99', 200, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"]', 4.6, 234, 'seller-001', 'active', 0, 'premium-cotton-tshirt'),

('prod-005', 'Classic Denim Jeans', 'Comfortable stretch denim with modern fit', 'CDJ-005', 'DenimCo', 'Clothing', '["jeans","denim","casual"]', '79.99', '99.99', 150, 'https://images.unsplash.com/photo-1542272454315-7f6b8c3f9c3f', '["https://images.unsplash.com/photo-1542272454315-7f6b8c3f9c3f"]', 4.4, 167, 'seller-001', 'active', 0, 'classic-denim-jeans'),

-- Home & Kitchen
('prod-006', 'Stainless Steel Coffee Maker', 'Programmable 12-cup coffee maker with thermal carafe', 'SSCM-006', 'BrewMaster', 'Home & Kitchen', '["coffee","kitchen","appliance"]', '89.99', NULL, 40, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6', '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6"]', 4.5, 312, 'seller-001', 'active', 1, 'stainless-steel-coffee-maker'),

('prod-007', 'Non-Stick Cookware Set', '10-piece professional grade non-stick cookware', 'NSCS-007', 'ChefPro', 'Home & Kitchen', '["cookware","kitchen","nonstick"]', '159.99', '199.99', 25, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', '["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"]', 4.8, 98, 'seller-001', 'active', 0, 'nonstick-cookware-set'),

-- Low stock product
('prod-008', 'Limited Edition Sneakers', 'Exclusive colorway, limited quantities available', 'LES-008', 'SneakerLux', 'Footwear', '["sneakers","limited","exclusive"]', '249.99', NULL, 5, 'https://images.unsplash.com/photo-1549298916-b41d501d3772', '["https://images.unsplash.com/photo-1549298916-b41d501d3772"]', 4.9, 23, 'seller-001', 'active', 1, 'limited-edition-sneakers'),

-- Out of stock product
('prod-009', 'Vintage Camera', 'Collectible vintage film camera in excellent condition', 'VC-009', 'RetroPhoto', 'Electronics', '["camera","vintage","film"]', '399.99', NULL, 0, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"]', 5.0, 12, 'seller-001', 'out_of_stock', 0, 'vintage-camera');

-- =====================================================
-- CART ITEMS
-- =====================================================
INSERT INTO cart_items (cart_item_id, user_id, product_id, quantity, price) VALUES
('cart-001', 'user-001', 'prod-001', 1, '199.99'),
('cart-002', 'user-001', 'prod-006', 2, '89.99'),
('cart-003', 'user-002', 'prod-002', 1, '299.99'),
('cart-004', 'user-002', 'prod-004', 3, '29.99');

-- =====================================================
-- ORDERS
-- =====================================================
INSERT INTO orders (
  order_id, user_id, order_number, subtotal, tax, shipping, total, status, payment_status,
  shipping_address_id, shipping_first_name, shipping_last_name, shipping_phone,
  shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
  billing_address_id, billing_first_name, billing_last_name, billing_phone,
  billing_street, billing_city, billing_state, billing_zip_code, billing_country,
  tracking_number, carrier, estimated_delivery, paid_at, shipped_at
) VALUES
(
  'order-001', 'user-001', 'ORD-2024-001', '389.98', '35.10', '15.00', '440.08', 'delivered', 'paid',
  'addr-001', 'John', 'Doe', '+1-555-0101',
  '123 Main Street', 'San Francisco', 'CA', '94102', 'US',
  'addr-001', 'John', 'Doe', '+1-555-0101',
  '123 Main Street', 'San Francisco', 'CA', '94102', 'US',
  'TRK123456789', 'USPS', '2024-01-15', '2024-01-10 10:30:00', '2024-01-12 09:00:00'
),
(
  'order-002', 'user-002', 'ORD-2024-002', '299.99', '27.00', '10.00', '336.99', 'shipped', 'paid',
  'addr-003', 'Jane', 'Smith', '+1-555-0102',
  '789 Oak Street', 'Los Angeles', 'CA', '90001', 'US',
  'addr-004', 'Jane', 'Smith', '+1-555-0102',
  '321 Elm Street', 'Los Angeles', 'CA', '90002', 'US',
  'TRK987654321', 'FedEx', '2024-01-18', '2024-01-15 14:20:00', '2024-01-16 11:00:00'
),
(
  'order-003', 'user-001', 'ORD-2024-003', '149.99', '13.50', '8.00', '171.49', 'processing', 'paid',
  'addr-002', 'John', 'Doe', '+1-555-0101',
  '456 Work Ave', 'San Francisco', 'CA', '94103', 'US',
  'addr-001', 'John', 'Doe', '+1-555-0101',
  '123 Main Street', 'San Francisco', 'CA', '94102', 'US',
  NULL, NULL, '2024-01-20', '2024-01-17 16:45:00', NULL
);

-- =====================================================
-- ORDER ITEMS
-- =====================================================
INSERT INTO order_items (order_item_id, order_id, product_id, product_name, product_image, product_sku, quantity, price, subtotal) VALUES
-- Order 001 items
('oi-001', 'order-001', 'prod-001', 'Wireless Bluetooth Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'WBH-001', 1, '199.99', '199.99'),
('oi-002', 'order-001', 'prod-006', 'Stainless Steel Coffee Maker', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6', 'SSCM-006', 2, '89.99', '179.98'),
('oi-003', 'order-001', 'prod-004', 'Premium Cotton T-Shirt', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'PCT-004', 1, '29.99', '29.99'),

-- Order 002 items
('oi-004', 'order-002', 'prod-002', 'Smart Watch Pro', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'SWP-002', 1, '299.99', '299.99'),

-- Order 003 items
('oi-005', 'order-003', 'prod-003', '4K Ultra HD Webcam', 'https://images.unsplash.com/photo-1570209306599-e99196ac8e45', 'UHD-003', 1, '149.99', '149.99');

-- =====================================================
-- REVIEWS
-- =====================================================
INSERT INTO reviews (review_id, product_id, user_id, order_id, rating, title, comment, verified, helpful) VALUES
('rev-001', 'prod-001', 'user-001', 'order-001', 5, 'Amazing sound quality!', 'These headphones are absolutely fantastic. The noise cancellation works perfectly and the battery lasts forever. Highly recommended!', 1, 45),
('rev-002', 'prod-001', 'user-002', NULL, 4, 'Great headphones, minor issues', 'Sound quality is excellent but the fit could be better for smaller heads. Still a solid purchase.', 0, 12),
('rev-003', 'prod-002', 'user-002', 'order-002', 5, 'Perfect fitness companion', 'Tracks everything I need and the battery life is impressive. The GPS is accurate and syncs perfectly with my phone.', 1, 34),
('rev-004', 'prod-006', 'user-001', 'order-001', 4, 'Good coffee maker', 'Makes great coffee but takes a bit longer to brew than expected. The thermal carafe keeps it hot for hours though.', 1, 23),
('rev-005', 'prod-004', 'user-001', 'order-001', 5, 'Best t-shirt ever!', 'So soft and comfortable. The organic cotton feels amazing and it has held up great after multiple washes.', 1, 67);

-- =====================================================
-- WISHLIST
-- =====================================================
INSERT INTO wishlist (wishlist_item_id, user_id, product_id) VALUES
('wish-001', 'user-001', 'prod-002'),
('wish-002', 'user-001', 'prod-007'),
('wish-003', 'user-002', 'prod-008'),
('wish-004', 'user-002', 'prod-001'),
('wish-005', 'user-004', 'prod-002'),
('wish-006', 'user-004', 'prod-006');

-- =====================================================
-- UPDATE PRODUCT ANALYTICS
-- =====================================================
UPDATE products SET views = 1523, purchases = 45 WHERE product_id = 'prod-001';
UPDATE products SET views = 987, purchases = 28 WHERE product_id = 'prod-002';
UPDATE products SET views = 645, purchases = 15 WHERE product_id = 'prod-003';
UPDATE products SET views = 2134, purchases = 89 WHERE product_id = 'prod-004';
UPDATE products SET views = 876, purchases = 34 WHERE product_id = 'prod-005';
UPDATE products SET views = 1456, purchases = 67 WHERE product_id = 'prod-006';
UPDATE products SET views = 543, purchases = 23 WHERE product_id = 'prod-007';
UPDATE products SET views = 2345, purchases = 12 WHERE product_id = 'prod-008';
UPDATE products SET views = 234, purchases = 0 WHERE product_id = 'prod-009';

-- =====================================================
-- SEED DATA COMPLETED
-- =====================================================
-- Summary:
-- - 5 Users (4 customers + 1 seller + 1 admin)
-- - 5 Addresses
-- - 9 Products (various categories, stock levels)
-- - 4 Cart Items
-- - 3 Orders (different statuses)
-- - 5 Order Items
-- - 5 Reviews (mix of verified/unverified)
-- - 6 Wishlist Items
-- =====================================================