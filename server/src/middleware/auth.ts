// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "../db/client";
import { sessions } from "../db/schema/sessions";
import { users } from "../db/schema/users";
import { getSessionId } from "./authCookies";

/**
 * Extended user type returned by auth middleware
 */
export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  status: "active" | "suspended" | "deleted";
}

/**
 * Resolves the authenticated user from the session cookie.
 * Returns null if no valid session or user account has issues.
 */
export async function getCurrentUser(req: Request): Promise<AuthUser | null> {
  // 1. Memoization: check if already resolved
  if ((req as any).user) return (req as any).user;

  const sessionId = getSessionId(req);
  if (!sessionId) return null;

  // 2. Access the environment and database instance
  const env = (req as any).env;
  if (!env) {
    console.error("Critical: 'env' not found on request object. Check index.ts middleware.");
    return null;
  }
  
  const db = getDb(env); 
  const nowIso = new Date().toISOString();

  try {
    const [result] = await db
      .select({
        userId: users.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        profileImageUrl: users.profileImageUrl,
        isAdmin: users.isAdmin,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        status: users.status,
      })
      .from(sessions)
      .innerJoin(users, eq(users.userId, sessions.userId))
      .where(
        and(
          eq(sessions.sessionId, sessionId),
          gt(sessions.expiresAt, nowIso)
        )
      )
      .limit(1);

    if (!result) return null;

    // Security check: Don't allow suspended or deleted accounts
    if (result.status === "suspended") {
      console.warn(`Suspended user attempted access: ${result.userId}`);
      return null;
    }
    
    if (result.status === "deleted") {
      console.warn(`Deleted user attempted access: ${result.userId}`);
      return null;
    }

    // Update last activity timestamp (fire and forget)
    db.update(sessions)
      .set({ lastActivityAt: nowIso })
      .where(eq(sessions.sessionId, sessionId))
      .run()
      .catch(err => console.error("Failed to update session activity:", err));

    return result as AuthUser;
  } catch (error) {
    console.error("Auth Middleware DB Error:", error);
    return null;
  }
}

/**
 * Middleware: Requires a valid session
 */
export const requireAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized",
        code: "AUTH_REQUIRED" 
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Requires email verification
 */
export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized",
        code: "AUTH_REQUIRED" 
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: "Email verification required",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Requires admin privileges
 */
export const requireAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized",
        code: "AUTH_REQUIRED" 
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        message: "Forbidden: Admin access required",
        code: "ADMIN_REQUIRED" 
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Requires active account status
 * Use this for sensitive operations
 */
export const requireActiveAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized",
        code: "AUTH_REQUIRED" 
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({ 
        message: "Account is not active",
        code: "ACCOUNT_INACTIVE",
        status: user.status
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Optional middleware: Attaches user if logged in, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req);
    (req as any).user = user; // null is fine
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware composition helper
 * Example: composeMiddleware(requireAuth, requireEmailVerified, requireAdmin)
 */
export const composeMiddleware = (...middlewares: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const execute = (index: number) => {
      if (index >= middlewares.length) {
        return next();
      }
      
      middlewares[index](req, res, (err?: any) => {
        if (err) return next(err);
        execute(index + 1);
      });
    };
    
    execute(0);
  };
};