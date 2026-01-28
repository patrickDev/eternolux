import { NextResponse } from "next/server";

/**
 * Proxy GET /api/products
 * → forwards request to Express backend
 * → preserves HttpOnly session cookies
 */
export async function GET(request: Request) {
  try {
    // Forward query params (e.g. ?search=...)
    const { search } = new URL(request.url);

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/products${search}`, {
      method: "GET",
      credentials: "include", // 🔐 forward cookies
      headers: {
        "Content-Type": "application/json",
        // forward cookies explicitly (important for Node fetch)
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (err) {
    console.error("❌ Products proxy error:", err);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
