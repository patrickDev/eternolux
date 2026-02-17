// src/controllers/userController.ts
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { hashPassword } from "../middleware/security/password";
import { getDb } from "../db/client"; // ✅ Fixed typo
import { users, type User } from "../db/schema";

/**
 * GET /api/users
 * Returns a list of all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb((req as any).env);
    const allUsers = await db.select().from(users);
    
    console.log("📋 Fetched all users:", allUsers.length);
    
    // Safety: Remove password hashes from the response
    const safeUsers = allUsers.map((user: User) => {
      const { passwordHash, ...safeUser } = user; // ✅ Fixed type
      return safeUser;
    });
    
    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error) {
    console.error("❌ getAllUsers error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users" 
    });
  }
};

/**
 * POST /api/users
 * Handles user registration
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    console.log("➕ Creating user:", { email, firstName, lastName });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ 
        success: false,
        message: "Email, password, first name, and last name are required" 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
      return;
    }

    const db = getDb((req as any).env);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      res.status(409).json({ 
        success: false,
        message: "Email already exists" 
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ 
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        email: email.trim().toLowerCase(),
        passwordHash,
        isAdmin: false,
      })
      .returning();

    console.log("✅ User created:", newUser.userId);

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error: any) {
    console.error("❌ createUser error:", error);

    if (error.message?.includes("UNIQUE")) {
      res.status(409).json({ 
        success: false,
        message: "Email already exists" 
      });
      return;
    }

    res.status(500).json({ 
      success: false,
      message: "Registration failed" 
    });
  }
};

/**
 * GET /api/users/:id
 * Fetches a single user by their UUID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("🔍 Fetching user:", id);

    if (!id || typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid user ID" 
      });
      return;
    }

    const db = getDb((req as any).env);
    
    // ✅ Fixed: Use limit(1) and array destructuring for Drizzle
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, id.trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
      return;
    }

    console.log("✅ User found:", user.email);

    // Remove password hash from response
    const { passwordHash, ...safeUser } = user;
    
    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("❌ getUserById error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving user" 
    });
  }
};

/**
 * PUT /api/users/:id
 * Update user profile
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone } = req.body;
    const currentUser = (req as any).user;

    console.log("✏️ Updating user:", id);

    // Only allow users to update their own profile (or admin)
    if (currentUser.userId !== id && !currentUser.isAdmin) {
      res.status(403).json({ 
        success: false,
        message: "You can only update your own profile" 
      });
      return;
    }

  if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid user ID" 
      });
      return;
    }

    const db = getDb((req as any).env);

    // Build update object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ 
        success: false,
        message: "No fields to update" 
      });
      return;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.userId, id.trim()))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
      return;
    }

    console.log("✅ User updated:", updatedUser.userId);

    // Remove password hash
    const { passwordHash, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("❌ updateUser error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating user" 
    });
  }
};

/**
 * DELETE /api/users/:id
 * Delete user (admin only or self-delete)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    console.log("🗑️ Deleting user:", id);

    // Only allow users to delete their own account (or admin)
    if (currentUser.userId !== id && !currentUser.isAdmin) {
      res.status(403).json({ 
        success: false,
        message: "You can only delete your own account" 
      });
      return;
    }

   if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({ 
        success: false,
        message: "Invalid user ID" 
      });
      return;
    }

    const db = getDb((req as any).env);

    const result = await db
      .delete(users)
      .where(eq(users.userId, id.trim()))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
      return;
    }

    console.log("✅ User deleted:", id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteUser error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting user" 
    });
  }
};