import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${backendUrl}/api/auth/me`, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
