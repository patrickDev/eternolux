// src/index.ts (ROOT - BACKEND)
// COMPLETE VERSION - All existing routes + Payments + Customer address

import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

// ══════════════════════════════════════════════════════════════
// EXISTING ROUTES (KEEP ALL OF THESE)
// ══════════════════════════════════════════════════════════════
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import searchRoutes from "./routes/searchRoutes";
import registerRoutes from "./routes/registerRoutes";

// ══════════════════════════════════════════════════════════════
// NEW ROUTES (PAYMENTS & CUSTOMERS)
// ══════════════════════════════════════════════════════════════
import paymentRoutes from "./routes/paymentRoutes";
//import customerRoutes from "./routes/customerRoutes";

// ══════════════════════════════════════════════════════════════
// EXISTING SECURITY MIDDLEWARE (KEEP ALL)
// ══════════════════════════════════════════════════════════════
import { applySecurityMiddleware, securityErrorHandler } from "./middleware/security";
import { authLimiter, userLimiter, productLimiter } from "./middleware/rateLimiter";

const app = express();
const PORT = 8080;

/* ==========================================================================
   1. INJECT CLOUDFLARE ENV → process.env (KEEP AS-IS)
   ========================================================================== */
const cfEnv = env as any;

// ✅ Safe to assign — these are NOT compile-time constants
if (cfEnv.CORS_ORIGIN)        process.env.CORS_ORIGIN        = cfEnv.CORS_ORIGIN;
if (cfEnv.TURSO_DATABASE_URL) process.env.TURSO_DATABASE_URL = cfEnv.TURSO_DATABASE_URL;
if (cfEnv.TURSO_AUTH_TOKEN)   process.env.TURSO_AUTH_TOKEN   = cfEnv.TURSO_AUTH_TOKEN;

// Use a custom key for env name (avoids the NODE_ENV constant issue)
if (cfEnv.NODE_ENV) process.env.APP_ENV = cfEnv.NODE_ENV;

// Inject full env into every request context (for route handlers)
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).env = cfEnv;
  next();
});

/* ==========================================================================
   2. SECURITY MIDDLEWARE (KEEP AS-IS)
   ========================================================================== */
applySecurityMiddleware(app);

// Cookie parser (after CORS, before routes)
app.use(cookieParser());

/* ==========================================================================
   3. LOGGING (KEEP AS-IS)
   ========================================================================== */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  res.on("finish", () => {
    const duration = (performance.now() - start).toFixed(2);
    const emoji = res.statusCode >= 500 ? "❌" : res.statusCode >= 400 ? "⚠️" : "✅";
    console.log(`${emoji} [${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/* ==========================================================================
   4. ROUTES
   ========================================================================== */

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "active",
    service: "eternolux-api",
    timestamp: new Date().toISOString(),
    environment: cfEnv.NODE_ENV || "development",
    corsOrigin: cfEnv.CORS_ORIGIN || "fallback",
    version: "1.0.0",
  });
});

// ══════════════════════════════════════════════════════════════
// EXISTING ROUTES (KEEP ALL - DON'T REMOVE ANY)
// ══════════════════════════════════════════════════════════════
app.use("/api/auth",     authLimiter,    authRoutes);
app.use("/api/products", productLimiter, productRoutes);
app.use("/api/search",   productLimiter, searchRoutes);
app.use("/api/users",    userLimiter,    userRoutes);
app.use("/api/register", authLimiter,    registerRoutes);

// ══════════════════════════════════════════════════════════════
// NEW ROUTES (PAYMENTS & CUSTOMERS) - ADD THESE
// ══════════════════════════════════════════════════════════════
app.use("/api/payments",  paymentRoutes);   // Stripe + Amazon Pay
//app.use("/api/customers", customerRoutes);  // Customer address saving

/* ==========================================================================
   5. 404 HANDLER (KEEP AS-IS)
   ========================================================================== */
   
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: "ROUTE_NOT_FOUND",
  });
});

/* ==========================================================================
   6. ERROR HANDLERS (KEEP AS-IS - MUST BE LAST)
   ========================================================================== */
app.use(securityErrorHandler);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ [Fatal Exception]:", err.message);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "An internal system error occurred." : err.message,
  });
});

app.listen(PORT);
export default httpServerHandler({ port: PORT });
