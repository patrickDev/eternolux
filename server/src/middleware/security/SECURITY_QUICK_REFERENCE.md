# Security Middleware Quick Reference

## 📦 Install Dependencies

```bash
npm install express helmet cors validator
npm install -D @types/express @types/cors @types/validator
```

## 🚀 Quick Setup (5 minutes)

```typescript
// index.ts
import express from "express";
import { applySecurityMiddleware, securityErrorHandler } from "./middleware/security";

const app = express();

// 1. Apply all security (one line!)
applySecurityMiddleware(app);

// 2. Your routes
app.use("/api", routes);

// 3. Error handler
app.use(securityErrorHandler);

app.listen(3000);
```

Done! Your app is now protected against:
- ✅ SQL Injection
- ✅ XSS Attacks
- ✅ CSRF Attacks
- ✅ DoS Attacks
- ✅ Parameter Pollution
- ✅ Header Injection
- ✅ And more...

## 🎯 Security Profiles (Copy & Paste)

### Auth Endpoints
```typescript
import { authProfile, validateRequired, validateEmail, validatePassword } from "./middleware/security";
import { authLimiter } from "./middleware/rateLimiter";

app.post("/api/auth/login",
  ...authProfile,
  authLimiter,
  validateRequired(["email", "password"]),
  validateEmail(),
  loginHandler
);

app.post("/api/auth/register",
  ...authProfile,
  authLimiter,
  validateRequired(["email", "password", "firstName", "lastName"]),
  validateEmail(),
  validatePassword(),
  registerHandler
);
```

### Public Read-Only
```typescript
import { publicReadOnlyProfile } from "./middleware/security";
import { apiLimiter } from "./middleware/rateLimiter";

app.get("/api/products",
  ...publicReadOnlyProfile,
  apiLimiter,
  getProducts
);
```

### Authenticated Endpoints
```typescript
import { publicWriteProfile, requireAuth } from "./middleware/security";
import { apiLimiter } from "./middleware/rateLimiter";

app.post("/api/cart",
  ...publicWriteProfile,
  requireAuth,
  apiLimiter,
  validateRequired(["productId", "quantity"]),
  addToCart
);
```

### Admin Endpoints
```typescript
import { adminProfile, requireAdmin } from "./middleware/security";
import { apiLimiter } from "./middleware/rateLimiter";

app.delete("/api/users/:id",
  requireAdmin,
  ...adminProfile,
  apiLimiter,
  deleteUser
);
```

## 🔧 Common Validations

### Email
```typescript
import { validateEmail } from "./middleware/security";

app.post("/api/auth/login",
  validateEmail(),
  loginHandler
);
```

### Password
```typescript
import { validatePassword } from "./middleware/security";

app.post("/api/auth/register",
  validatePassword(),  // Min 8 chars, uppercase, lowercase, number
  registerHandler
);
```

### Required Fields
```typescript
import { validateRequired } from "./middleware/security";

app.post("/api/orders",
  validateRequired(["shippingAddressId", "billingAddressId"]),
  createOrder
);
```

## 🛡️ CSRF Protection

### Backend
```typescript
import { csrfProtection, getCsrfTokenEndpoint } from "./middleware/security";

// Get token endpoint
app.get("/api/csrf-token", getCsrfTokenEndpoint);

// Protected route
app.post("/api/orders", csrfProtection, createOrder);
```

### Frontend
```typescript
// 1. Get CSRF token
const { csrfToken } = await fetch("/api/csrf-token").then(r => r.json());

// 2. Include in requests
await fetch("/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify(order),
});
```

## 📊 Protection Summary

| Attack | Protection | Middleware |
|--------|-----------|------------|
| SQL Injection | Pattern detection + ORM | `preventSqlInjection` |
| XSS | Input sanitization + CSP | `preventXss` + headers |
| CSRF | Token validation | `csrfProtection` |
| Brute Force | Rate limiting | `authLimiter` |
| DoS | Request limits + slow down | `limitBodySize` + `slowDown` |
| Clickjacking | X-Frame-Options header | `securityHeaders` |
| MIME Sniffing | X-Content-Type-Options | `securityHeaders` |
| Protocol Downgrade | HSTS header | `securityHeaders` |

## 🔍 Testing Commands

### Test Security
```bash
# SQL Injection (should block)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"pass OR 1=1"}'

# XSS (should block)
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"comment":"<script>alert(1)</script>"}'

# Rate Limit (6th request should 429)
for i in {1..6}; do curl http://localhost:3000/api/auth/login; done
```

## 📁 File Structure

```
middleware/
├── security/
│   ├── index.ts              # Main orchestrator ⭐
│   ├── inputValidation.ts    # SQL/XSS protection
│   ├── headers.ts            # Security headers
│   ├── csrf.ts               # CSRF protection
│   └── requestLimits.ts      # Request limits
├── auth.ts                   # Authentication
├── authCookies.ts            # Session cookies
└── rateLimiter.ts            # Rate limiting
```

## 🎯 Most Important Files

1. **security/index.ts** - Main file, import everything from here
2. **inputValidation.ts** - SQL injection + XSS protection
3. **auth.ts** - User authentication
4. **rateLimiter.ts** - Rate limiting

## ⚡ Production Checklist

```env
# .env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
SESSION_MAX_AGE=604800
```

```typescript
// Verify setup
✅ applySecurityMiddleware(app) called first
✅ All auth routes use authLimiter
✅ All write routes use CSRF protection
✅ HTTPS enabled
✅ Security headers verified
✅ Rate limits tested
```

## 🚨 Common Mistakes

### ❌ Don't Do This
```typescript
// Raw SQL with user input
db.execute(sql`SELECT * FROM users WHERE email = '${email}'`);

// Missing CSRF on POST
app.post("/api/orders", createOrder);

// No rate limiting on auth
app.post("/api/auth/login", loginHandler);

// No input validation
app.post("/api/users", createUser);
```

### ✅ Do This Instead
```typescript
// Parameterized queries
db.select().from(users).where(eq(users.email, email));

// CSRF protection
app.post("/api/orders", csrfProtection, createOrder);

// Rate limiting
app.post("/api/auth/login", authLimiter, loginHandler);

// Input validation
app.post("/api/users", validateRequired(["email"]), validateEmail(), createUser);
```

## 💡 Pro Tips

1. **Always sanitize inputs** - Even with ORM, sanitize for XSS
2. **Use security profiles** - Don't repeat middleware
3. **Test security** - Automated tests for injection attempts
4. **Monitor logs** - Watch for security events
5. **Update dependencies** - Keep security packages updated

## 📚 Resources

- Input Validation: `middleware/security/inputValidation.ts`
- Security Headers: `middleware/security/headers.ts`
- CSRF Protection: `middleware/security/csrf.ts`
- Complete Guide: `SECURITY_IMPLEMENTATION_GUIDE.md`

---

**Your backend is now secure! 🔐**

Copy the files, run `npm install`, add one line to your index.ts, and you're protected!
