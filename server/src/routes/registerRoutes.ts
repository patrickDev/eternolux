import { Router } from "express";
import { registerController } from "../controllers/registerController";

const router = Router();

// POST /api/auth/register
router.post("/register", registerController);

export default router;
