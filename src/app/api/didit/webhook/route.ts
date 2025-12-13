import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.otsembank.com";

function verifySignature(body: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    const expectedSignature = hmac.update(body).digest("hex");
    
    try {
        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const providedBuffer = Buffer.from(signature, "utf8");
        
        if (expectedBuffer.length !== providedBuffer.length) {
            return false;
        }
        
        return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-webhook-signature");
        
        if (DIDIT_WEBHOOK_SECRET && signature) {
            if (!verifySignature(rawBody, signature, DIDIT_WEBHOOK_SECRET)) {
                console.error("Invalid webhook signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }
        }
        
        const payload = JSON.parse(rawBody);
        
        const {
            webhook_type,
            session_id,
            status,
            vendor_data,
            decision,
        } = payload;
        
        console.log("Didit webhook received:", {
            type: webhook_type,
            sessionId: session_id,
            status,
            customerId: vendor_data,
        });
        
        if (webhook_type === "status.updated" && vendor_data) {
            let accountStatus: string;
            
            switch (status) {
                case "Approved":
                    accountStatus = "approved";
                    break;
                case "Declined":
                    accountStatus = "rejected";
                    break;
                case "In Progress":
                case "Not Started":
                    accountStatus = "in_review";
                    break;
                default:
                    accountStatus = "in_review";
            }
            
            try {
                const updateResponse = await fetch(
                    `${API_URL}/customers/${vendor_data}/kyc-status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            accountStatus,
                            diditSessionId: session_id,
                            diditStatus: status,
                            diditDecision: decision,
                        }),
                    }
                );
                
                if (!updateResponse.ok) {
                    console.error("Failed to update customer KYC status:", await updateResponse.text());
                }
            } catch (err) {
                console.error("Error updating customer KYC status:", err);
            }
        }
        
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
