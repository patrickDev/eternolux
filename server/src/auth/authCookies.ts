import type { Response, Request } from "express";

const COOKIE_NAME = "eternolux_session";

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
  });
}

export function getSessionId(req: Request): string | null {
  return req.cookies?.[COOKIE_NAME] ?? null;
}
