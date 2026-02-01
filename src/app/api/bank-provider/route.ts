import { NextRequest, NextResponse } from "next/server";
import {
  getActiveBank,
  setActiveBank,
} from "@/lib/bank-provider-cache";

export async function GET() {
  return NextResponse.json({ provider: getActiveBank() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const provider = body.provider as string;
  if (!provider) {
    return NextResponse.json(
      { message: "provider is required" },
      { status: 400 }
    );
  }
  setActiveBank(provider);
  return NextResponse.json({ provider: getActiveBank() });
}
