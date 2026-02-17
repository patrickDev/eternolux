// middleware/rateLimiter.ts
import { Request, Response, NextFunction } from "express";

/**
 * In-memory rate limiter
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const store: RateLimitStore = {};
let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Cleanup expired entries
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  lastCleanup = now;
  
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
  
  console.log(`🧹 Rate limiter cleanup: ${Object.keys(store).length} active clients`);
};

/**
 * Create rate limiter middleware
 */
const createRateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Cleanup during requests
      cleanupExpiredEntries();
      
      // Get client identifier
      const clientKey = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();

      // Initialize or reset if window expired
      if (!store[clientKey] || store[clientKey].resetAt < now) {
        store[clientKey] = {
          count: 0,
          resetAt: now + windowMs,
        };
      }

      // Increment request count
      store[clientKey].count++;

      const remaining = Math.max(0, maxRequests - store[clientKey].count);
      const resetAt = store[clientKey].resetAt;

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", new Date(resetAt).toISOString());

      // Check if limit exceeded
      if (store[clientKey].count > maxRequests) {
        const retryAfter = Math.ceil((resetAt - now) / 1000);
        
        res.setHeader("Retry-After", retryAfter.toString());

        console.log(`🚫 Rate limit exceeded for ${clientKey}: ${store[clientKey].count}/${maxRequests}`);

        res.status(429).json({
          success: false,
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter: `${retryAfter}s`,
          limit: maxRequests,
          windowMs: windowMs / 1000,
        });
        return;
      }

      console.log(`✅ Rate limit OK for ${clientKey}: ${store[clientKey].count}/${maxRequests}`);
      next();
    } catch (error) {
      console.error("❌ Rate limiter error:", error);
      next(); // Don't block on error
    }
  };
};

/**
 * Predefined rate limiters
 */

// Auth endpoints (5 requests per minute)
export const authLimiter = createRateLimiter(
  60 * 1000,  // 1 minute
  5           // 5 requests
);

// User endpoints (100 requests per minute)
export const userLimiter = createRateLimiter(
  60 * 1000,  // 1 minute
  100         // 100 requests
);

// Product endpoints (300 requests per minute)
export const productLimiter = createRateLimiter(
  60 * 1000,  // 1 minute
  300         // 300 requests
);

// API endpoints (100 requests per minute)
export const apiLimiter = createRateLimiter(
  60 * 1000,  // 1 minute
  100         // 100 requests
);

// Public endpoints (300 requests per minute)
export const publicLimiter = createRateLimiter(
  60 * 1000,  // 1 minute
  300         // 300 requests
);

// Checkout endpoints (10 requests per hour)
export const checkoutLimiter = createRateLimiter(
  60 * 60 * 1000,  // 1 hour
  10               // 10 requests
);

/**
 * Get rate limit status
 */
export const getRateLimitStatus = (req: Request) => {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  return store[clientKey] || null;
};

/**
 * Reset rate limit for client
 */
export const resetRateLimit = (clientKey: string) => {
  delete store[clientKey];
};

/**
 * Get all rate limit stats
 */
export const getRateLimitStats = () => {
  return {
    totalClients: Object.keys(store).length,
    clients: Object.entries(store).map(([key, value]) => ({
      client: key,
      requests: value.count,
      resetAt: new Date(value.resetAt).toISOString(),
    })),
  };
};

/**
 * Custom rate limiter
 */
export function customRateLimiter(
  requests: number,
  windowMinutes: number
) {
  return createRateLimiter(windowMinutes * 60 * 1000, requests);
}