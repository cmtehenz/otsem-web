import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/token";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetLevel, documents } = body;

        if (!targetLevel || !documents || documents.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const authHeader = request.headers.get("authorization");
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/customers/kyc-upgrade-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({
                targetLevel,
                documents,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to create upgrade request" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating upgrade request:", error);
        return NextResponse.json(
            { error: "Failed to create upgrade request" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "PENDING";

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/admin/kyc-upgrade-requests?status=${status}`, {
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch upgrade requests" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching upgrade requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch upgrade requests" },
            { status: 500 }
        );
    }
}
