// middleware/session.ts
import { getDb } from "../db/client";
import { sessions } from "../db/schema";
import { eq, lt, desc } from "drizzle-orm";
import crypto from "crypto";

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  env: any,
  options: {
    userAgent?: string;
    ipAddress?: string;
    expiresInDays?: number;
  } = {}
): Promise<{ sessionId: string; token: string; expiresAt: string }> {
  const db = getDb(env);
  
  // Generate session token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Calculate expiration (default 7 days)
  const expiresInDays = options.expiresInDays || 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  
  // Create session in database
  const [session] = await db.insert(sessions).values({
    userId,
    token,
    userAgent: options.userAgent,
    ipAddress: options.ipAddress,
    expiresAt: expiresAt.toISOString(),
  }).returning();
  
  return {
    sessionId: session.sessionId,
    token: session.token,
    expiresAt: session.expiresAt,
  };
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string, env: any) {
  const db = getDb(env);
  
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId))
    .limit(1);
  
  return session || null;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(
  sessionId: string,
  env: any
): Promise<void> {
  const db = getDb(env);
  
  await db.delete(sessions)
    .where(eq(sessions.sessionId, sessionId));
}

/**
 * Delete all sessions for a user (logout all devices)
 */
export async function deleteAllUserSessions(
  userId: string,
  env: any
): Promise<void> {
  const db = getDb(env);
  
  await db.delete(sessions)
    .where(eq(sessions.userId, userId));
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  userId: string,
  env: any
) {
  const db = getDb(env);
  
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt));
}

/**
 * Update session expiration
 */
export async function extendSession(
  sessionId: string,
  env: any,
  expiresInDays: number = 7
): Promise<void> {
  const db = getDb(env);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  
  await db
    .update(sessions)
    .set({ expiresAt: expiresAt.toISOString() })
    .where(eq(sessions.sessionId, sessionId));
}

/**
 * Delete expired sessions (cleanup job)
 */
export async function cleanupExpiredSessions(env: any): Promise<number> {
  const db = getDb(env);
  const now = new Date().toISOString();
  
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, now));
  
  return result.rowsAffected || 0;
}

/**
 * Validate session
 */
export async function validateSession(
  sessionId: string,
  env: any
): Promise<boolean> {
  const session = await getSession(sessionId, env);
  
  if (!session) return false;
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(sessionId, env);
    return false;
  }
  
  return true;
}