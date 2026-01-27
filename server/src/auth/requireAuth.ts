import type { Request, Response, NextFunction } from "express";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies?.eternolux_session;

  if (!sessionId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const now = new Date().toISOString();

  const session = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.userId, sessions.userId))
    .where(and(eq(sessions.sessionId, sessionId), gt(sessions.expiresAt, now)))
    .limit(1)
    .then((r) => r[0]);

  if (!session) {
    return res.status(401).json({ message: "Session expired" });
  }

  // attach user to request
  (req as any).user = session.user;
  next();
}
