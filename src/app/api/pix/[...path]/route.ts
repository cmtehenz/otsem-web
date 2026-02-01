import { NextRequest, NextResponse } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.otsembank.com"
)
  .trim()
  .replace(/\/+$/, "");

/**
 * Server-side proxy for PIX requests.
 *
 * Forwards to the backend's generic /pix/{path} endpoint which internally
 * routes to the active bank provider based on admin settings.
 *
 * By proxying server-side we guarantee the Authorization header is forwarded
 * regardless of browser CORS behaviour.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${API_URL}/pix/${path.join("/")}`;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") || "application/json",
  };

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const body = await request.text();
    const backendRes = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });

    const responseBody = await backendRes.text();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: {
        "Content-Type":
          backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to connect to payment service" },
      { status: 502 }
    );
  }
}
