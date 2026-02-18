// middleware/auth.ts (BACKEND - NEW FILE IF MISSING)
import { Request, Response, NextFunction } from "express";
import { validateSession, getSessionData } from "./session";
import { clearSessionCookie } from "./authCookies";

/**
 * Middleware to require authentication
 * Validates session and attaches user ID to request
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.session_id;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_SESSION"
      });
    }

    const env = (req as any).env;

    // Validate session
    const isValid = await validateSession(token, env);
    if (!isValid) {
      clearSessionCookie(res);
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
        code: "SESSION_EXPIRED"
      });
    }

    // Get session data
    const session = await getSessionData(token, env);
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({
        success: false,
        message: "Session not found",
        code: "SESSION_NOT_FOUND"
      });
    }

    // Attach user ID to request for use in route handlers
    (req as any).userId = session.userId;
    (req as any).sessionId = session.sessionId;

    next();
  } catch (error: any) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication check failed",
      code: "AUTH_ERROR"
    });
  }
};

/**
 * Middleware to check if user is admin
 * Must be used after requireAuth
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_AUTH"
      });
    }

    const env = (req as any).env;
    const { getDb } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const db = getDb(env);
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        code: "FORBIDDEN"
      });
    }

    next();
  } catch (error: any) {
    console.error("❌ Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
      code: "AUTH_ERROR"
    });
  }
};