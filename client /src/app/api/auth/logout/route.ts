import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${backendUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    credentials: "include",
  });

  return NextResponse.json({ message: "Logged out" }, { status: res.status });
}
