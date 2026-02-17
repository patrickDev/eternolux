// controllers/authController.ts
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { verifyPassword, needsRehash, hashPassword } from "../middleware/security/password";
import { createSession, deleteSession, deleteAllUserSessions } from "../middleware/session";
import { setSessionCookie, clearSessionCookie, getSessionId } from "../middleware/authCookies";

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
        code: "MISSING_CREDENTIALS"
      });
    }
    
    const env = (req as any).env;
    const db = getDb(env);
    
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }
    
    // Check account status
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Account has been suspended",
        code: "ACCOUNT_SUSPENDED"
      });
    }
    
    if (user.status === "deleted") {
      return res.status(403).json({
        success: false,
        message: "Account has been deleted",
        code: "ACCOUNT_DELETED"
      });
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }
    
    // Check if password needs rehashing (security upgrade)
    if (needsRehash(user.passwordHash, 12)) {
      const newHash = await hashPassword(password, 12);
      await db.update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.userId, user.userId));
    }
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(users.userId, user.userId));
    
    // Create session (30 days if remember me, 7 days otherwise)
    const session = await createSession(user.userId, env, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.socket.remoteAddress,
      expiresInDays: rememberMe ? 30 : 7,
    });
    
    // Set session cookie
    setSessionCookie(res, session.sessionId, {
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    });
    
    console.log(`✅ User logged in: ${user.email} (${user.userId})`);
    
    res.json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        isAdmin: user.isAdmin,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      code: "LOGIN_ERROR"
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const env = (req as any).env;
    
    if (sessionId) {
      await deleteSession(sessionId, env);
      console.log(`✅ User logged out (session: ${sessionId})`);
    }
    
    clearSessionCookie(res);
    
    res.json({
      success: true,
      message: "Logout successful"
    });
    
  } catch (error: any) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "LOGOUT_ERROR"
    });
  }
};

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const env = (req as any).env;
    
    await deleteAllUserSessions(user.userId, env);
    clearSessionCookie(res);
    
    console.log(`✅ User logged out from all devices: ${user.email}`);
    
    res.json({
      success: true,
      message: "Logged out from all devices"
    });
    
  } catch (error: any) {
    console.error("❌ Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout from all devices",
      code: "LOGOUT_ALL_ERROR"
    });
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
        code: "NOT_AUTHENTICATED"
      });
    }
    
    res.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        isAdmin: user.isAdmin,
        status: user.status,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      code: "GET_USER_ERROR"
    });
  }
};