import { db } from "../db/client";
import { users, sessions } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { Request } from "express";
import { getSessionId } from "./authCookies";

/**
 * Resolve the currently authenticated user (or null)
 */
export async function getCurrentUser(req: Request) {
  const sessionId = getSessionId(req);
  if (!sessionId) return null;

  const nowIso = new Date().toISOString();

  const result = await db
    .select({
      userId: users.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isAdmin: users.isAdmin,
    })
    .from(sessions)
    .innerJoin(users, eq(users.userId, sessions.userId))
    .where(
      and(
        eq(sessions.sessionId, sessionId),
        gt(sessions.expiresAt, nowIso)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Express middleware — require login
 */
export function requireAuth() {
  return async (req: Request, res: any, next: any) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  };
}

/**
 * Express middleware — require admin
 */
export function requireAdmin() {
  return async (req: Request, res: any, next: any) => {
    const user = await getCurrentUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    (req as any).user = user;
    next();
  };
}
