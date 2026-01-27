import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../auth/password";
import { createSession } from "../auth/createSession";
import { setSessionCookie } from "../auth/authCookies";
import type { Request, Response } from "express";

export async function signinController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((r) => r[0]);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // ✅ create session in DB
  const session = await createSession(user.userId);

  // ✅ set HttpOnly cookie
  setSessionCookie(res, session.sessionId);

  return res.json({
    user: {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
}
