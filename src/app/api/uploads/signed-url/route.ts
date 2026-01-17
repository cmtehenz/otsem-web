import { NextRequest, NextResponse } from "next/server";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

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
    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!privateObjectDir) {
        throw new Error("Object storage not configured");
    }

    const { bucketName } = parsePath(privateObjectDir);
    
    const objectName = path.replace(/^\/objects\//, "private/");

    return { bucketName, objectName };
}

function parsePath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
        throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { objectPath, method = "GET" } = body;

        if (!objectPath) {
            return NextResponse.json(
                { error: "Missing required field: objectPath" },
                { status: 400 }
            );
        }

        const { bucketName, objectName } = parseObjectPath(objectPath);

        const url = await signObjectURL({
            bucketName,
            objectName,
            method: method as "GET" | "PUT" | "DELETE" | "HEAD",
            ttlSec: 900,
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json(
            { error: "Failed to generate signed URL" },
            { status: 500 }
        );
    }
}
