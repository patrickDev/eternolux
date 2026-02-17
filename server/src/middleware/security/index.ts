// middleware/security/index.ts

import { Express, Request, Response, NextFunction } from "express";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { sanitizeInput, preventSqlInjection } from "./inputValidation";

export function applySecurityMiddleware(app: Express) {

  // ── 1. Helmet ─────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy:     false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // ── 2. CORS ───────────────────────────────────────────────
  // Reads CORS_ORIGIN from process.env (set from wrangler.json
  // vars by src/index.ts before this middleware runs).
  //
  // wrangler.json dev:
  //   "CORS_ORIGIN": "http://localhost:3000,https://wwd.eternolux.com"
  const getAllowedOrigins = (): string[] => {
    const raw =
      process.env.CORS_ORIGIN ||
      "http://localhost:3000,https://wwd.eternolux.com";
    return raw.split(",").map((o) => o.trim()).filter(Boolean);
  };

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl, Postman, mobile
      const allowed = getAllowedOrigins();
      if (allowed.includes(origin) || allowed.includes("*")) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked: ${origin} | Allowed: ${allowed.join(", ")}`);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials:    true,
    methods:        ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "X-CSRF-Token"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge:         86400,
    // ✅ preflightContinue: false (default) means cors() responds to
    // OPTIONS requests automatically — no app.options() handler needed.
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // ✅ This single line handles ALL routes including OPTIONS preflight.
  // Do NOT add app.options("*") or app.options("/(.*)")  — path-to-regexp
  // v8+ (used by newer Wrangler) throws on wildcard route patterns.
  app.use(cors(corsOptions));

  // ── 3. Body parsers ───────────────────────────────────────
  app.use(express.json({ limit: "10mb", strict: true }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── 4. Request size limits ────────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.length > 2000) {
      return res.status(414).json({ error: "URI Too Long", code: "URI_TOO_LONG" });
    }
    if (Object.keys(req.query || {}).length > 50) {
      return res.status(400).json({ error: "Too many query parameters", code: "TOO_MANY_PARAMS" });
    }
    next();
  });

  // ── 5. Input sanitization ─────────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query && typeof req.query === "object") {
        Object.keys(req.query).forEach((key) => {
          if (typeof req.query[key] === "string") {
            req.query[key] = (req.query[key] as string).trim();
            if (preventSqlInjection(req.query[key] as string)) {
              throw new Error("SQL injection attempt detected in query");
            }
          }
        });
      }
      if (req.body && typeof req.body === "object") {
        Object.keys(req.body).forEach((key) => {
          if (typeof req.body[key] === "string") {
            req.body[key] = req.body[key].trim();
            req.body[key] = sanitizeInput(req.body[key]);
            if (
              !key.toLowerCase().includes("password") &&
              preventSqlInjection(req.body[key])
            ) {
              throw new Error("SQL injection attempt detected in body");
            }
          }
        });
      }
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: "Bad Request",
        message: error.message,
        code: "INVALID_INPUT",
      });
    }
  });

  // ── 6. CSRF (skip safe methods + public paths) ────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) return next();
    const publicPaths = ["/health", "/api/auth/register", "/api/auth/login", "/api/register"];
    if (publicPaths.some((p) => req.path === p || req.path.startsWith(p))) {
      return next();
    }
    console.log(`🔒 Protected: ${method} ${req.path}`);
    next();
  });

  // ── 7. Suspicious request logging ────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const patterns = [/(\bor\b|\band\b).*?=.*?/i, /<script/i, /javascript:/i, /\.\.\/\.\.\//, /\x00/];
    if (patterns.some((p) => p.test(req.url) || p.test(JSON.stringify(req.body)))) {
      console.warn(`⚠️  Suspicious: ${req.method} ${req.path} from ${req.ip}`);
    }
    next();
  });
}

export function securityErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.message?.toLowerCase().includes("cors")) {
    return res.status(403).json({ error: "Forbidden", message: "CORS policy violation", code: "CORS_ERROR" });
  }
  if (err.status === 429 || err.statusCode === 429) {
    return res.status(429).json({ error: "Too Many Requests", message: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload Too Large", code: "PAYLOAD_TOO_LARGE" });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON", code: "INVALID_JSON" });
  }
  next(err);
}

export * from "./inputValidation";
export * from "./password";
