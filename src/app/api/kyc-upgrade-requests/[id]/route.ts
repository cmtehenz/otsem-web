import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("authorization");
        const { id } = params;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/admin/kyc-upgrade-requests/${id}`, {
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch upgrade request" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching upgrade request:", error);
        return NextResponse.json(
            { error: "Failed to fetch upgrade request" },
            { status: 500 }
        );
    }
}
