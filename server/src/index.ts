// src/index.ts (ROOT - BACKEND)
import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import searchRoutes from "./routes/searchRoutes";
import registerRoutes from "./routes/registerRoutes";

// Security middleware
import { applySecurityMiddleware, securityErrorHandler } from "./middleware/security";
import { authLimiter, userLimiter, productLimiter } from "./middleware/rateLimiter";

const app = express();
const PORT = 8080;

/* ==========================================================================
   1. INJECT CLOUDFLARE ENV → process.env (MUST BE ABSOLUTE FIRST)

   Cloudflare Workers vars live in the `env` object from wrangler.json,
   NOT in process.env. We copy them here so middleware can use process.env.
   
   ⚠️  Do NOT assign process.env.NODE_ENV — esbuild treats it as a
       compile-time constant and will throw "assign-to-define" warning.
   ========================================================================== */
const cfEnv = env as any;

// ✅ Safe to assign — these are NOT compile-time constants
if (cfEnv.CORS_ORIGIN)        process.env.CORS_ORIGIN        = cfEnv.CORS_ORIGIN;
if (cfEnv.TURSO_DATABASE_URL) process.env.TURSO_DATABASE_URL = cfEnv.TURSO_DATABASE_URL;

// Use a custom key for env name (avoids the NODE_ENV constant issue)
if (cfEnv.NODE_ENV) process.env.APP_ENV = cfEnv.NODE_ENV;

// Inject full env into every request context (for route handlers)
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).env = cfEnv;
  next();
});

/* ==========================================================================
   2. SECURITY MIDDLEWARE (CORS, Helmet, body parser, sanitization)
   Must be BEFORE routes.
   ========================================================================== */
applySecurityMiddleware(app);

// Cookie parser (after CORS, before routes)
app.use(cookieParser());

/* ==========================================================================
   3. LOGGING
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

app.use("/api/auth",     authLimiter,    authRoutes);
app.use("/api/products", productLimiter, productRoutes);
app.use("/api/search",   productLimiter, searchRoutes);
app.use("/api/users",    userLimiter,    userRoutes);
app.use("/api/register", authLimiter,    registerRoutes);

/* ==========================================================================
   5. 404 HANDLER
   ========================================================================== */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: "ROUTE_NOT_FOUND",
  });
});

/* ==========================================================================
   6. ERROR HANDLERS (MUST BE LAST)
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