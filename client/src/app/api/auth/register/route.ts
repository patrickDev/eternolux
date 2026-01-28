import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${backendUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, {
    status: res.status,
  });
}
