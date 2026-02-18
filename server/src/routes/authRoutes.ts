// routes/authRoutes.ts (BACKEND - FIXED)
import express from "express";
import { register, checkEmailAvailability } from "../controllers/registerController";
import { signin, signout, me } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { 
  validateRequired, 
  validateEmail, 
  validatePassword 
} from "../middleware/security";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  validateRequired(["email", "password", "firstName", "lastName", "phone"]),
  validateEmail("email"),
  validatePassword("password"),
  register
);

/**
 * GET /api/auth/check-email
 * Check if email is available
 */
router.get("/check-email", checkEmailAvailability);

/**
 * POST /api/auth/signin  ← CHANGED from /login
 * Login user
 */
router.post(
  "/signin",
  validateRequired(["email", "password"]),
  validateEmail("email"),
  signin
);

/**
 * POST /api/auth/signout  ← CHANGED from /logout
 * Logout user (requires authentication)
 */
router.post("/signout", requireAuth, signout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", requireAuth, me);

export default router;