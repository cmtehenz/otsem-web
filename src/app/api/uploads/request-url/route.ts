import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const storage = new Storage({
    credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
            url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
            format: {
                type: "json",
                subject_token_field_name: "access_token",
            },
        },
        universe_domain: "googleapis.com",
    },
    projectId: "",
});

async function signObjectURL({
    bucketName,
    objectName,
    method,
    ttlSec,
}: {
    bucketName: string;
    objectName: string;
    method: "GET" | "PUT" | "DELETE" | "HEAD";
    ttlSec: number;
}): Promise<string> {
    const request = {
        bucket_name: bucketName,
        object_name: objectName,
        method,
        expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };
    const response = await fetch(
        `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }
    );
    if (!response.ok) {
        throw new Error(
            `Failed to sign object URL, errorcode: ${response.status}`
        );
    }

    const { signed_url: signedURL } = await response.json();
    return signedURL;
}

function parseObjectPath(path: string): {
    bucketName: string;
    objectName: string;
} {
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
        throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return {
        bucketName,
        objectName,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Missing required field: name" },
                { status: 400 }
            );
        }

        const privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
        if (!privateObjectDir) {
            return NextResponse.json(
                { error: "Object storage not configured" },
                { status: 500 }
            );
        }

        const objectId = randomUUID();
        const extension = name.split(".").pop() || "";
        const fullPath = `${privateObjectDir}/kyc-upgrades/${objectId}${extension ? `.${extension}` : ""}`;

        const { bucketName, objectName } = parseObjectPath(fullPath);

        const uploadURL = await signObjectURL({
            bucketName,
            objectName,
            method: "PUT",
            ttlSec: 900,
        });

        const objectPath = `/objects/kyc-upgrades/${objectId}${extension ? `.${extension}` : ""}`;

        return NextResponse.json({
            uploadURL,
            objectPath,
            metadata: { name },
        });
    } catch (error) {
        console.error("Error generating upload URL:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
