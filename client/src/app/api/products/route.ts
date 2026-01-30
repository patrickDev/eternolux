import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const backendUrl = process.env.BACKEND_URL;
  
  // ✅ FIX: Ensure all search params (?productId=123) are forwarded to the backend
  const target = `${backendUrl}/api/products${url.search}`;

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!res.headers.get("content-type")?.includes("application/json")) {
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ message: "Proxy error", error: String(err) }, { status: 500 });
  }
}