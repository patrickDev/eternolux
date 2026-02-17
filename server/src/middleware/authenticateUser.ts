// src/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { sessions, users } from "../db/schema";

/**
 * Middleware to authenticate user via session cookie
 * Checks if valid session exists and attaches user to request
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.cookies?.session;

    console.log("🔐 Authenticating session:", sessionId ? "present" : "missing");

    if (!sessionId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const env = (req as any).env;
    const db = getDb(env);

    // Find session in database
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
      return;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < now) {
      console.log("⏰ Session expired:", sessionId);
      
      // Delete expired session
      await db
        .delete(sessions)
        .where(eq(sessions.sessionId, sessionId));

      res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
      return;
    }

    // Find user associated with session
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, session.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Attach user to request object
    (req as any).user = user;
    (req as any).sessionId = sessionId;

    console.log("✅ User authenticated:", user.email);

    next();
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Middleware to require admin privileges
 * Must be used AFTER authenticateUser
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!user.isAdmin) {
      console.log("🚫 Admin access denied for:", user.email);
      res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
      return;
    }

    console.log("✅ Admin access granted:", user.email);
    next();
  } catch (error) {
    console.error("❌ Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no session
 * Useful for endpoints that work differently for logged-in users
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      next();
      return;
    }

    const env = (req as any).env;
    const db = getDb(env);

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);

    if (session) {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt >= now) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.userId, session.userId))
          .limit(1);

        if (user) {
          (req as any).user = user;
          (req as any).sessionId = sessionId;
        }
      }
    }

    next();
  } catch (error) {
    console.error("❌ Optional auth error:", error);
    // Don't fail request, just continue without user
    next();
  }
};