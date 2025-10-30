// src/app/(app)/layout.tsx
"use client";

import * as React from "react";
import { Protected } from "@/components/auth/Protected";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (

        <Protected>
            {children}
        </Protected>

    );
}
