// controllers/authController.ts (BACKEND)
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { verifyPassword } from "../middleware/security/password";
import { createSession, deleteSession, getSessionData, validateSession } from "../middleware/session";
import { setSessionCookie, clearSessionCookie } from "../middleware/authCookies";

/**
 * Sign in user
 * POST /api/auth/signin
 */
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }
    
    const env = (req as any).env;
    const db = getDb(env);
    
    // 2. Find user by email
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
    
    // 3. Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }
    
    // 4. Check account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is suspended or inactive",
        code: "ACCOUNT_INACTIVE"
      });
    }
    
    // 5. Create session in database
    const session = await createSession(user.userId, env, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.socket.remoteAddress,
      expiresInDays: 7,
    });
    
    // 6. Set session cookie (use token, not sessionId)
    setSessionCookie(res, session.token);
    
    // 7. Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(users.userId, user.userId));
    
    // 8. Log signin
    console.log(`✅ User signed in: ${user.email} (${user.userId})`);
    
    // 9. Return success response (exclude password hash)
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
        isAdmin: user.isAdmin,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      code: "SIGNIN_ERROR"
    });
  }
};

/**
 * Sign out user
 * POST /api/auth/signout
 */
export const signout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_id;
    
    if (token) {
      const env = (req as any).env;
      
      // Find session by token
      const session = await getSessionData(token, env);
      if (session) {
        await deleteSession(session.sessionId, env);
      }
    }
    
    // Clear cookie
    clearSessionCookie(res);
    
    console.log(`✅ User signed out`);
    
    res.json({
      success: true,
      message: "Logged out successfully"
    });
    
  } catch (error: any) {
    console.error("❌ Signout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "SIGNOUT_ERROR"
    });
  }
};

/**
 * Get current user from session
 * GET /api/auth/me
 */
export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_id;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
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
        message: "Session expired",
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
    
    // Get user from database
    const db = getDb(env);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, session.userId))
      .limit(1);
    
    if (!user) {
      await deleteSession(session.sessionId, env);
      clearSessionCookie(res);
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }
    
    // Return user (exclude password hash)
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
        isAdmin: user.isAdmin,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Session check error:", error);
    res.status(500).json({
      success: false,
      message: "Session check failed",
      code: "SESSION_CHECK_ERROR"
    });
  }
};