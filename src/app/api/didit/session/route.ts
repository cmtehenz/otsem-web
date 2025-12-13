import { NextRequest, NextResponse } from "next/server";

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
const DIDIT_BASE_URL = "https://verification.didit.me";

export async function POST(request: NextRequest) {
    try {
        if (!DIDIT_API_KEY || !DIDIT_WORKFLOW_ID) {
            return NextResponse.json(
                { error: "Didit API não configurada" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { customerId, email } = body;

        if (!customerId) {
            return NextResponse.json(
                { error: "customerId é obrigatório" },
                { status: 400 }
            );
        }

        const response = await fetch(`${DIDIT_BASE_URL}/v2/session/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": DIDIT_API_KEY,
            },
            body: JSON.stringify({
                workflow_id: DIDIT_WORKFLOW_ID,
                vendor_data: customerId,
                metadata: {
                    customer_id: customerId,
                },
                contact_details: email ? {
                    email: email,
                    email_lang: "pt",
                } : undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Didit API error:", errorData);
            return NextResponse.json(
                { error: "Falha ao criar sessão de verificação" },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        return NextResponse.json({
            sessionId: data.session_id,
            verificationUrl: data.verification_url,
        });
    } catch (error) {
        console.error("Error creating Didit session:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
