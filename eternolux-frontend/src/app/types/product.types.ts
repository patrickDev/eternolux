// src/app/types/product.types.ts
// Mirrors the Drizzle schema in db/schema exactly.
// Field names match what the API serializes from Turso.

// ─────────────────────────────────────────────────────────────
// PRODUCT  (db/schema/products.ts)
// ─────────────────────────────────────────────────────────────
export interface Product {
  // ── Primary Key ───────────────────────────────────────────
  productId:          string;                        // product_id (PK)

  // ── Basic Info ────────────────────────────────────────────
  name:               string;
  description:        string | null;
  sku:                string;
  brand:              string | null;
  category:           string;
  tags:               string[] | null;               // JSON array

  // ── Pricing ───────────────────────────────────────────────
  price:              number;
  originalPrice:      number | null;                 // original_price
  costPrice:          number | null;                 // cost_price (not shown to customers)

  // ── Inventory ─────────────────────────────────────────────
  stock:              number;
  lowStockThreshold:  number | null;                 // low_stock_threshold (default 10)

  // ── Media ─────────────────────────────────────────────────
  imageUrl:           string | null;                 // image_url
  images:             string[] | null;               // JSON array of extra image URLs

  // ── Physical ──────────────────────────────────────────────
  weight:             number | null;
  dimensions:         ProductDimensions | null;      // JSON object

  // ── Ratings & Reviews ─────────────────────────────────────
  rating:             number | null;
  reviewCount:        number | null;                 // review_count (default 0)

  // ── Seller ────────────────────────────────────────────────
  sellerId:           string | null;                 // seller_id → FK users.userId

  // ── Status & Visibility ───────────────────────────────────
  status:             ProductStatus;                 // default "active"
  isFeatured:         boolean;                       // is_featured (default false)

  // ── SEO ───────────────────────────────────────────────────
  slug:               string | null;
  metaTitle:          string | null;                 // meta_title
  metaDescription:    string | null;                 // meta_description

  // ── Analytics ─────────────────────────────────────────────
  views:              number | null;                 // default 0
  purchases:          number | null;                 // default 0

  // ── Timestamps ────────────────────────────────────────────
  createdAt:          string;                        // created_at  ISO string
  updatedAt:          string | null;                 // updated_at  ISO string
}

export type ProductStatus =
  | "active"
  | "draft"
  | "out_of_stock"
  | "discontinued";

export interface ProductDimensions {
  length: number;
  width:  number;
  height: number;
  unit:   "cm" | "in";
}

// Drizzle infer equivalents for frontend use
export type NewProduct = Omit<Product, "productId" | "createdAt" | "updatedAt">;

// ─────────────────────────────────────────────────────────────
// CART ITEM  (Product + quantity, client-side only)
// ─────────────────────────────────────────────────────────────
export interface CartItem extends Product {
  quantity: number;
}

// ─────────────────────────────────────────────────────────────
// USER  (db/schema/users.ts)
// ─────────────────────────────────────────────────────────────
export interface User {
  // ── Primary Key ───────────────────────────────────────────
  userId:             string;                        // user_id (PK)

  // ── Basic Info ────────────────────────────────────────────
  firstName:          string;                        // first_name
  lastName:           string;                        // last_name
  phone:              string;
  email:              string;

  // ── Profile ───────────────────────────────────────────────
  profileImageUrl:    string | null;                 // profile_image_url
  dateOfBirth:        string | null;                 // date_of_birth

  // ── Verification & Security ───────────────────────────────
  emailVerified:      boolean;                       // email_verified
  phoneVerified:      boolean;                       // phone_verified
  twoFactorEnabled:   boolean;                       // two_factor_enabled

  // ── Admin & Status ────────────────────────────────────────
  isAdmin:            boolean;                       // is_admin
  status:             UserStatus;                    // default "active"

  // ── Timestamps ────────────────────────────────────────────
  lastLoginAt:        string | null;                 // last_login_at
  createdAt:          string;
  updatedAt:          string | null;
}

export type UserStatus = "active" | "suspended" | "deleted";

// Safe public user (strip sensitive fields before sending to client)
export type PublicUser = Omit<User, "emailVerified" | "phoneVerified" | "twoFactorEnabled" | "isAdmin">;

// ─────────────────────────────────────────────────────────────
// WISHLIST  (db/schema/wishlist.ts)
// ─────────────────────────────────────────────────────────────
export interface WishlistItem {
  wishlistItemId:     string;                        // wishlist_item_id (PK)
  userId:             string;                        // user_id → FK users.userId
  productId:          string;                        // product_id → FK products.productId
  addedAt:            string;                        // added_at  ISO string
}

// Wishlist item with full product data joined (for display)
export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

// ─────────────────────────────────────────────────────────────
// API RESPONSE SHAPES  (what the backend returns)
// ─────────────────────────────────────────────────────────────
export interface ApiProductsResponse {
  success:  boolean;
  count:    number;
  products: Product[];
}

export interface ApiProductResponse {
  success: boolean;
  product: Product;
}

export interface ApiWishlistResponse {
  success:  boolean;
  wishlist: WishlistItemWithProduct[];
}

export interface ApiUserResponse {
  success: boolean;
  user:    PublicUser;
}