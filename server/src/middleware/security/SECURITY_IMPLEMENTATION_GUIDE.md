# Complete Security Middleware Implementation Guide

## 📁 File Structure

```
middleware/
├── security/
│   ├── index.ts                  # Main security orchestrator
│   ├── inputValidation.ts        # SQL injection, XSS, input sanitization
│   ├── headers.ts                # Security headers, CORS, CSP
│   ├── csrf.ts                   # CSRF protection
│   └── requestLimits.ts          # Request validation and limits
├── auth.ts                       # Authentication middleware
├── authCookies.ts                # Session cookie utilities
└── rateLimiter.ts                # Rate limiting
```

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "validator": "^13.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/validator": "^13.11.7"
  }
}
```

Install:
```bash
npm install express helmet cors validator
npm install -D @types/express @types/cors @types/validator
```

## 🚀 Quick Setup

### 1. Basic Setup (index.ts)

```typescript
import express from "express";
import { applySecurityMiddleware, securityErrorHandler } from "./middleware/security";

const app = express();

// Apply all security middleware
applySecurityMiddleware(app);

// Your routes here
app.use("/api", apiRoutes);

// Security error handler (must be last)
app.use(securityErrorHandler);

app.listen(3000);
```

### 2. Environment Variables

```env
# .env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
COOKIE_DOMAIN=yourdomain.com
SESSION_MAX_AGE=604800
```

## 🎯 Protection Layers

### Layer 1: Input Validation & Sanitization

**Protects against**: SQL Injection, XSS, Code Injection

```typescript
import { 
  sanitizeAll,
  preventSqlInjection,
  preventXss 
} from "./middleware/security";

// Applied globally
app.use(sanitizeAll);           // Sanitize all inputs
app.use(preventSqlInjection);   // Block SQL injection
app.use(preventXss);            // Block XSS attacks
```

**What it does**:
- Removes HTML tags
- Escapes special characters
- Validates input formats
- Detects malicious patterns

### Layer 2: Security Headers

**Protects against**: Clickjacking, MIME sniffing, XSS, Protocol downgrade

```typescript
import { securityHeaders, customSecurityHeaders } from "./middleware/security";

app.use(securityHeaders);       // Helmet security headers
app.use(customSecurityHeaders); // Custom headers
```

**Headers set**:
- `Content-Security-Policy` - Prevent XSS
- `X-Frame-Options: DENY` - Prevent clickjacking
- `Strict-Transport-Security` - Force HTTPS
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy` - Control referrer info

### Layer 3: CSRF Protection

**Protects against**: Cross-Site Request Forgery

```typescript
import { csrfProtection } from "./middleware/security";

// Protected routes
app.post("/api/orders", csrfProtection, createOrder);
app.delete("/api/users/:id", csrfProtection, deleteUser);

// Get CSRF token
app.get("/api/csrf-token", getCsrfTokenEndpoint);
```

**How it works**:
1. Client gets CSRF token: `GET /api/csrf-token`
2. Client includes token in requests: `X-CSRF-Token: <token>`
3. Server validates token before processing

### Layer 4: Request Limits

**Protects against**: DoS, Buffer overflow, Parameter pollution

```typescript
import { 
  limitBodySize,
  limitUrlLength,
  limitQueryParams 
} from "./middleware/security";

app.use(limitBodySize(10));      // Max 10MB
app.use(limitUrlLength(2048));   // Max 2048 chars
app.use(limitQueryParams(50));   // Max 50 params
```

### Layer 5: Rate Limiting

**Protects against**: Brute force, DoS

```typescript
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";

// Auth endpoints - strict
app.post("/api/auth/login", authLimiter, loginHandler);

// API endpoints - standard
app.get("/api/products", apiLimiter, getProducts);
```

## 📋 Route-Specific Security

### Public Endpoints (Read-Only)

```typescript
import { publicReadOnlyProfile } from "./middleware/security";

app.get("/api/products", 
  ...publicReadOnlyProfile,
  getProducts
);
```

**Applied**:
- ✅ GET/HEAD/OPTIONS only
- ✅ 1MB body limit
- ✅ Slow down after 50 requests

### Public Endpoints (Write)

```typescript
import { publicWriteProfile } from "./middleware/security";

app.post("/api/cart", 
  ...publicWriteProfile,
  addToCart
);
```

**Applied**:
- ✅ All HTTP methods
- ✅ JSON content-type only
- ✅ 5MB body limit
- ✅ CSRF protection
- ✅ Slow down after 20 requests

### Authentication Endpoints

```typescript
import { authProfile } from "./middleware/security";

app.post("/api/auth/login",
  ...authProfile,
  validateRequired(["email", "password"]),
  validateEmail(),
  loginHandler
);

app.post("/api/auth/register",
  ...authProfile,
  validateRequired(["email", "password", "firstName", "lastName"]),
  validateEmail(),
  validatePassword(),
  registerHandler
);
```

**Applied**:
- ✅ POST only
- ✅ JSON content-type only
- ✅ 1MB body limit
- ✅ Aggressive slow down (3 attempts)
- ✅ Field validation

### Admin Endpoints

```typescript
import { adminProfile, requireAdmin } from "./middleware/security";

app.delete("/api/users/:id",
  requireAdmin,
  ...adminProfile,
  deleteUser
);
```

**Applied**:
- ✅ All HTTP methods
- ✅ JSON content-type only
- ✅ 50MB body limit
- ✅ CSRF protection
- ✅ Origin validation
- ✅ Admin authentication

### File Upload Endpoints

```typescript
import { uploadProfile } from "./middleware/security";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

app.post("/api/upload",
  ...uploadProfile,
  upload.single("file"),
  uploadHandler
);
```

**Applied**:
- ✅ POST/PUT only
- ✅ multipart/form-data
- ✅ 100MB body limit
- ✅ CSRF protection

## 🔧 Custom Security Profiles

### Create Your Own

```typescript
import { secureRoute } from "./middleware/security";

const myCustomProfile = secureRoute({
  methods: ["GET", "POST"],
  contentTypes: ["application/json"],
  maxBodySize: 2,
  requireCsrf: true,
  customValidation: (req, res, next) => {
    // Your custom validation
    if (!req.headers["x-api-key"]) {
      return res.status(401).json({ error: "API key required" });
    }
    next();
  }
});

app.post("/api/custom", ...myCustomProfile, handler);
```

## 🎯 Complete Example: E-Commerce Routes

```typescript
import express from "express";
import {
  applySecurityMiddleware,
  publicReadOnlyProfile,
  publicWriteProfile,
  authProfile,
  adminProfile,
  validateRequired,
  validateEmail,
  validatePassword,
  securityErrorHandler,
} from "./middleware/security";
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
} from "./middleware/auth";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";

const app = express();

// Global security
applySecurityMiddleware(app);

// ===== Public Routes =====

// Products (read-only)
app.get("/api/products",
  ...publicReadOnlyProfile,
  apiLimiter,
  getProducts
);

app.get("/api/products/:id",
  ...publicReadOnlyProfile,
  apiLimiter,
  getProduct
);

// Search (read-only)
app.get("/api/search",
  ...publicReadOnlyProfile,
  apiLimiter,
  searchProducts
);

// ===== Auth Routes =====

// Login
app.post("/api/auth/login",
  ...authProfile,
  authLimiter,
  validateRequired(["email", "password"]),
  validateEmail(),
  loginHandler
);

// Register
app.post("/api/auth/register",
  ...authProfile,
  authLimiter,
  validateRequired(["email", "password", "firstName", "lastName"]),
  validateEmail(),
  validatePassword(),
  registerHandler
);

// Logout
app.post("/api/auth/logout",
  requireAuth,
  logoutHandler
);

// ===== Cart Routes =====

// Add to cart
app.post("/api/cart",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  validateRequired(["productId", "quantity"]),
  addToCart
);

// Get cart
app.get("/api/cart",
  requireAuth,
  apiLimiter,
  getCart
);

// Update cart item
app.put("/api/cart/:itemId",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  updateCartItem
);

// Remove from cart
app.delete("/api/cart/:itemId",
  requireAuth,
  apiLimiter,
  removeFromCart
);

// ===== Order Routes =====

// Create order
app.post("/api/orders",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  validateRequired(["shippingAddressId", "billingAddressId"]),
  createOrder
);

// Get orders
app.get("/api/orders",
  requireAuth,
  apiLimiter,
  getOrders
);

// Get order details
app.get("/api/orders/:id",
  requireAuth,
  apiLimiter,
  getOrder
);

// ===== Review Routes =====

// Add review
app.post("/api/reviews",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  validateRequired(["productId", "rating"]),
  addReview
);

// Get product reviews
app.get("/api/products/:id/reviews",
  ...publicReadOnlyProfile,
  apiLimiter,
  getProductReviews
);

// ===== Wishlist Routes =====

// Add to wishlist
app.post("/api/wishlist",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  validateRequired(["productId"]),
  addToWishlist
);

// Get wishlist
app.get("/api/wishlist",
  requireAuth,
  apiLimiter,
  getWishlist
);

// ===== Admin Routes =====

// Get all users (admin)
app.get("/api/admin/users",
  requireAdmin,
  ...adminProfile,
  apiLimiter,
  getAllUsers
);

// Delete user (admin)
app.delete("/api/admin/users/:id",
  requireAdmin,
  ...adminProfile,
  apiLimiter,
  deleteUser
);

// Update product (admin)
app.put("/api/admin/products/:id",
  requireAdmin,
  ...adminProfile,
  apiLimiter,
  updateProduct
);

// Security error handler (must be last)
app.use(securityErrorHandler);

export default app;
```

## 🔍 Testing Security

### Test SQL Injection

```bash
# Should be blocked
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password OR 1=1"}'

# Response: 400 Bad Request - "Invalid input detected"
```

### Test XSS

```bash
# Should be blocked/sanitized
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","rating":5,"comment":"<script>alert(1)</script>"}'

# Response: 400 Bad Request - "Invalid input detected"
```

### Test CSRF

```bash
# Without token - should fail
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","quantity":1}'

# Response: 403 Forbidden - "CSRF token required"

# With token - should succeed
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"productId":"prod-001","quantity":1}'
```

### Test Rate Limiting

```bash
# Make 6 requests quickly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 6th request: 429 Too Many Requests
```

## ⚠️ Important Notes

### SQL Injection Protection

**Multiple layers**:
1. ✅ Input validation (blocks patterns)
2. ✅ Input sanitization (removes dangerous chars)
3. ✅ Drizzle ORM (parameterized queries)

**Never use raw SQL with user input**:
```typescript
// ❌ DANGEROUS
await db.execute(sql`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE (parameterized)
await db.select().from(users).where(eq(users.email, email));
```

### XSS Protection

**Multiple layers**:
1. ✅ Input validation (blocks patterns)
2. ✅ Input sanitization (removes HTML)
3. ✅ Security headers (CSP)
4. ✅ Output encoding (on frontend)

### CSRF Protection

**Required for**:
- POST, PUT, DELETE, PATCH requests
- State-changing operations
- Authenticated endpoints

**Not required for**:
- GET, HEAD, OPTIONS (safe methods)
- Public read-only endpoints

## 🎯 Security Checklist

- [x] SQL injection protection
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting
- [x] Input validation
- [x] Input sanitization
- [x] Security headers
- [x] CORS configuration
- [x] Request size limits
- [x] Content-Type validation
- [x] Session security
- [x] Authentication
- [x] Authorization
- [x] Error handling
- [x] Logging

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS
- [ ] Enable HTTPS
- [ ] Set secure cookies
- [ ] Configure trust proxy
- [ ] Set up monitoring
- [ ] Test all security layers
- [ ] Enable logging
- [ ] Set up alerts

Your backend is now production-ready with comprehensive security! 🔐
