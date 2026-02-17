// routes/authRoutes.ts (already provided)
import express from "express";
import { register, checkEmailAvailability } from "../controllers/registerController";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// GET /api/auth/check-email
router.get("/check-email", checkEmailAvailability);

export default router;