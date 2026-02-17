// src/routes/userRoutes.ts
import { Router } from "express";
import { 
  getAllUsers, 
  createUser, 
  getUserById
} from "../controllers/userController";
import { authLimiter, userLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply userLimiter to all routes (optional)
// router.use(userLimiter);

// Public - registration with strict rate limiting
router.post("/", authLimiter, createUser);  // 5 req/min

// Other routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;