// middleware/authCookies.ts
import { Request, Response } from "express";

/**
 * Cookie configuration
 */
interface CookieOptions {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
  path: string;
  maxAge: number; // in seconds
  domain?: string;
  partitioned?: boolean;
}

/**
 * Default session cookie configuration
 */
const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  name: "eterno_session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only in production
  sameSite: "Strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
  partitioned: true, // CHIPS - Chrome's partitioned cookies
};

/**
 * Build cookie string from options
 */
function buildCookieString(
  name: string,
  value: string,
  options: Partial<CookieOptions>
): string {
  const parts: string[] = [
    `${name}=${value}`,
  ];

  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.partitioned) parts.push("Partitioned");

  return parts.join("; ");
}

/**
 * Sets the session cookie (Login)
 * 
 * @param res Express response object
 * @param sessionId Session identifier
 * @param options Optional cookie configuration overrides
 */
export function setSessionCookie(
  res: Response,
  sessionId: string,
  options: Partial<CookieOptions> = {}
): void {
  const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  
  const cookieString = buildCookieString(
    cookieOptions.name,
    sessionId,
    cookieOptions
  );

  res.setHeader("Set-Cookie", cookieString);
}

/**
 * Wipes the session cookie (Logout)
 * 
 * @param res Express response object
 * @param cookieName Optional cookie name (defaults to eterno_session)
 */
export function clearSessionCookie(
  res: Response,
  cookieName: string = DEFAULT_COOKIE_OPTIONS.name
): void {
  const cookieString = buildCookieString(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  res.setHeader("Set-Cookie", cookieString);
}

/**
 * Helper to extract Session ID from cookie header
 * 
 * @param req Express request object
 * @param cookieName Optional cookie name (defaults to eterno_session)
 * @returns Session ID or null if not found
 */
export function getSessionId(
  req: Request,
  cookieName: string = DEFAULT_COOKIE_OPTIONS.name
): string | null {
  const cookieHeader = req.headers.cookie;
  
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split("; ");
  const sessionCookie = cookies.find((cookie) => 
    cookie.startsWith(`${cookieName}=`)
  );

  if (!sessionCookie) {
    return null;
  }

  const [, sessionId] = sessionCookie.split("=");
  return sessionId || null;
}

/**
 * Parse all cookies from request
 * Useful for debugging or handling multiple cookies
 * 
 * @param req Express request object
 * @returns Object with cookie key-value pairs
 */
export function parseCookies(req: Request): Record<string, string> {
  const cookieHeader = req.headers.cookie;
  
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split("; ")
    .reduce((cookies, cookie) => {
      const [key, value] = cookie.split("=");
      if (key && value) {
        cookies[key] = value;
      }
      return cookies;
    }, {} as Record<string, string>);
}

/**
 * Validate session ID format
 * Add custom validation logic here
 * 
 * @param sessionId Session ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidSessionId(sessionId: string | null): boolean {
  if (!sessionId) return false;
  
  // Basic validation: not empty and reasonable length
  if (sessionId.length < 16 || sessionId.length > 128) {
    return false;
  }

  // Check for suspicious characters (basic XSS prevention)
  const suspiciousChars = /[<>'"]/;
  if (suspiciousChars.test(sessionId)) {
    return false;
  }

  return true;
}

/**
 * Refresh session cookie (extend expiration)
 * Call this on each authenticated request to implement sliding sessions
 * 
 * @param req Express request object
 * @param res Express response object
 */
export function refreshSessionCookie(req: Request, res: Response): void {
  const sessionId = getSessionId(req);
  
  if (sessionId && isValidSessionId(sessionId)) {
    setSessionCookie(res, sessionId);
  }
}

/**
 * Set multiple cookies at once
 * 
 * @param res Express response object
 * @param cookies Array of cookie configurations
 */
export function setMultipleCookies(
  res: Response,
  cookies: Array<{
    name: string;
    value: string;
    options?: Partial<CookieOptions>;
  }>
): void {
  const cookieStrings = cookies.map(({ name, value, options = {} }) => {
    const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
    return buildCookieString(name, value, cookieOptions);
  });

  res.setHeader("Set-Cookie", cookieStrings);
}

/**
 * Environment-specific cookie configuration
 */
export const getCookieConfig = (): CookieOptions => {
  return {
    ...DEFAULT_COOKIE_OPTIONS,
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "604800", 10), // 7 days default
  };
};

/**
 * Export cookie name constant for consistency
 */
export const SESSION_COOKIE_NAME = DEFAULT_COOKIE_OPTIONS.name;
