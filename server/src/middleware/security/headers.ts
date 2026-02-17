// middleware/security/headers.ts
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";

/**
 * Security headers configuration
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking
  frameguard: {
    action: "deny",
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Prevent MIME sniffing
  noSniff: true,

  // XSS Protection (legacy browsers)
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
});

/**
 * Custom security headers
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive data
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  next();
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allowed origins from environment
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173", // Vite
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  maxAge: 600, // 10 minutes
};

/**
 * Trust proxy configuration
 * Use when behind reverse proxy (nginx, Cloudflare, etc.)
 */
export const configureTrustProxy = (app: any) => {
  // Trust first proxy
  app.set("trust proxy", 1);
};
