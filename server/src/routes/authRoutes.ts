import { Router } from "express";
import { signinController } from "../controllers/signinController";
import { registerController } from "../controllers/registerController";
import { requireAuth } from "../auth/requireAuth";
import { clearSessionCookie } from "../auth/authCookies";

const router = Router();

/**
 * REGISTER
 * POST /api/auth/register
 */
router.post("/register", registerController);
/**
 * LOGIN
 * POST /api/auth/signin
 */
router.post("/signin", signinController);

/**
 * LOGOUT
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ message: "Logged out" });
});


/**
 * CURRENT USER
 * GET /api/auth/me
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
