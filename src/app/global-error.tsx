"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#fafafa",
          color: "#111",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>
            Something went wrong!
          </h1>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: "#6F00FF",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginBottom: 24,
            }}
          >
            Try again
          </button>
          <details style={{ textAlign: "left" }}>
            <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>
              Error details
            </summary>
            <pre
              style={{
                marginTop: 8,
                fontSize: 11,
                background: "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                overflow: "auto",
                maxHeight: 300,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        </div>
      </body>
    </html>
  );
}
