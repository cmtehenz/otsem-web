import { NextRequest, NextResponse } from "next/server";
import {
  getActiveBank,
  setActiveBank,
  isBankCacheInitialized,
} from "@/lib/bank-provider-cache";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.otsembank.com"
)
  .trim()
  .replace(/\/+$/, "");

/** Try to populate the bank cache from the backend (best-effort). */
async function ensureBankCache(authHeader: string | null): Promise<void> {
  if (isBankCacheInitialized()) return;
  try {
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;
    const res = await fetch(`${API_URL}/admin/settings/bank`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.activeBankProvider) {
        setActiveBank(data.activeBankProvider);
      }
    }
  } catch {
    // Silently fall back to the default ("inter").
  }
}

/**
 * Server-side proxy for PIX requests.
 *
 * Routes to /{activeBank}/pix/{path} (e.g. /inter/pix/cobrancas or
 * /fdbank/pix/cobrancas) based on the admin-configured active bank provider.
 *
 * The bank is read from an in-memory cache that the admin settings page keeps
 * in sync.  On first request (cold start) the proxy tries to fetch the setting
 * from the backend; if that fails it defaults to "inter".
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const authHeader = request.headers.get("authorization");

  await ensureBankCache(authHeader);

  const bank = getActiveBank(); // "inter" or "fdbank"
  const targetUrl = `${API_URL}/${bank}/pix/${path.join("/")}`;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") || "application/json",
  };
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
