// controllers/registerController.ts (BACKEND - UPDATED)
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { hashPassword, validatePasswordStrength } from "../middleware/security/password";
import { createSession } from "../middleware/session";
import { setSessionCookie } from "../middleware/authCookies";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // 1. Validate required fields
    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        code: "MISSING_FIELDS",
        required: ["email", "password", "firstName", "lastName", "phone"]
      });
    }
    
    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        code: "INVALID_EMAIL"
      });
    }
    
    // 3. Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet requirements",
        code: "WEAK_PASSWORD",
        errors: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }
    
    // 4. Validate phone format (basic)
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone format",
        code: "INVALID_PHONE"
      });
    }
    
    const env = (req as any).env;
    const db = getDb(env);
    
    // 5. Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        code: "USER_EXISTS"
      });
    }
    
    // 6. Hash password
    const passwordHash = await hashPassword(password);
    
    // 7. Create user
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      isAdmin: false,
      status: "active",
      profileImageUrl: null,
      dateOfBirth: null,
      lastLoginAt: new Date().toISOString(),
    }).returning();
    
    // 8. Create session in database
    const session = await createSession(newUser.userId, env, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.socket.remoteAddress,
      expiresInDays: 7,
    });
    
    // 9. Set session cookie (use token, not sessionId)
    setSessionCookie(res, session.token);
    
    // 10. Log registration
    console.log(`✅ New user registered: ${newUser.email} (${newUser.userId})`);
    
    // 11. Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        userId: newUser.userId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        emailVerified: newUser.emailVerified,
        phoneVerified: newUser.phoneVerified,
        isAdmin: newUser.isAdmin,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    
    // Handle specific database errors
    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({
        success: false,
        message: "User already exists",
        code: "USER_EXISTS"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      code: "REGISTRATION_ERROR"
    });
  }
};

/**
 * Check if email is available
 * GET /api/auth/check-email?email=test@example.com
 */
export const checkEmailAvailability = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email parameter required",
        code: "MISSING_EMAIL"
      });
    }
    
    const env = (req as any).env;
    const db = getDb(env);
    
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    res.json({
      success: true,
      available: existingUser.length === 0,
      email: email.toLowerCase()
    });
    
  } catch (error: any) {
    console.error("❌ Check email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check email availability",
      code: "CHECK_EMAIL_ERROR"
    });
  }
};