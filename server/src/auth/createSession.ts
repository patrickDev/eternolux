import { db } from "../db/client";
import { sessions } from "../db/schema";

export async function createSession(userId: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      expiresAt: expires.toISOString(),
    })
    .returning();

  return session;
}
