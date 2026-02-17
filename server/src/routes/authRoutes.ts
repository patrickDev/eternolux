// routes/authRoutes.ts
import express from "express";
import { register, checkEmailAvailability } from "../controllers/registerController";
import { login, logout, getCurrentUser } from "../controllers/authController";
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
 * POST /api/auth/login
 * Login user
 */
router.post(
  "/login",
  validateRequired(["email", "password"]),
  validateEmail("email"),
  login
);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
router.post("/logout", requireAuth, logout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", requireAuth, getCurrentUser);

export default router;