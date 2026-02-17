// middleware/security/csrf.ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Store CSRF tokens (in production, use Redis or database)
 */
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get or create CSRF token for session
 */
export function getCsrfToken(sessionId: string): string {
  // Check if token exists and is valid
  const existing = csrfTokens.get(sessionId);
  const now = Date.now();

  if (existing && existing.expiresAt > now) {
    return existing.token;
  }

  // Generate new token
  const token = generateCsrfToken();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  csrfTokens.set(sessionId, { token, expiresAt });

  // Cleanup expired tokens (probabilistic)
  if (Math.random() < 0.01) {
    cleanupExpiredTokens();
  }

  return token;
}

/**
 * Cleanup expired CSRF tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expiresAt <= now) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) return false;
  if (stored.expiresAt <= Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(stored.token),
    Buffer.from(token)
  );
}

/**
 * Middleware: Generate CSRF token for session
 */
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = (req as any).sessionId || "anonymous";
  const token = getCsrfToken(sessionId);

  // Attach token to response locals
  res.locals.csrfToken = token;

  // Add token to response header
  res.setHeader("X-CSRF-Token", token);

  next();
};

/**
 * Middleware: Verify CSRF token
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const sessionId = (req as any).sessionId;

  if (!sessionId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Session required",
      code: "NO_SESSION",
    });
  }

  // Get token from header or body
  const token = req.headers["x-csrf-token"] as string || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      error: "Forbidden",
      message: "CSRF token required",
      code: "CSRF_TOKEN_MISSING",
    });
  }

  // Verify token
  if (!verifyCsrfToken(sessionId, token)) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid CSRF token",
      code: "CSRF_TOKEN_INVALID",
    });
  }

  next();
};

/**
 * Middleware: CSRF protection for specific routes
 */
export const csrfProtectRoutes = (routes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const shouldProtect = routes.some(route => {
      if (route.includes("*")) {
        const pattern = new RegExp(route.replace(/\*/g, ".*"));
        return pattern.test(req.path);
      }
      return req.path.startsWith(route);
    });

    if (shouldProtect) {
      return csrfProtection(req, res, next);
    }

    next();
  };
};

/**
 * Endpoint to get CSRF token
 */
export const getCsrfTokenEndpoint = (req: Request, res: Response) => {
  const sessionId = (req as any).sessionId;

  if (!sessionId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Session required",
      code: "NO_SESSION",
    });
  }

  const token = getCsrfToken(sessionId);

  res.json({ csrfToken: token });
};
