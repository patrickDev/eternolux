import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  /**
   * 🛠️ FIX 1: Internal Networking
   * Inside Docker, 'localhost' refers to the client container itself.
   * We must use 'http://server:4000' to reach the backend service.
   */
  const backendUrl = process.env.BACKEND_URL || "http://server:4000";
  
  const target = `${backendUrl}/api/products${url.search}`;

  try {
    console.log(`[Proxy] Fetching from: ${target}`);

    const res = await fetch(target, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // Forward the cookies for authentication (e.g., session tokens)
        "Cookie": request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
        console.error(`[Proxy] Backend error: ${res.status} ${res.statusText}`);
    }

    // Check if the response is actually JSON
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      return new NextResponse(text, { 
        status: res.status,
        headers: { "Content-Type": contentType || "text/plain" }
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err: any) {
    console.error("[Proxy] Critical Failure:", err.message);
    
    return NextResponse.json(
      { 
        message: "Proxy error", 
        error: String(err),
        targetUrl: target // Helpful for debugging Docker logs
      }, 
      { status: 500 }
    );
  }
}