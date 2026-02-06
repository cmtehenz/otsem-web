// src/components/auth/HeaderUserChip.tsx
"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";

function initials(nameOrEmail?: string) {
    const s = (nameOrEmail ?? "").trim();
    if (!s) return "U";
    const parts = s.split(/\s+/).filter(Boolean);
    const base = parts.length >= 2 ? parts[0][0] + parts[1][0] : s.slice(0, 2);
    return base.toUpperCase();
}

export function HeaderUserChip() {
    const { user } = useAuth();
    const title = user?.name || user?.email || "Usuário";
    const subtitle = user?.email || "";

    return (
        <div
            className="ml-auto flex items-center rounded-full border bg-background px-2 py-1.5 gap-2 sm:px-3"
            role="group"
            aria-label="Usuário autenticado"
        >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                {initials(user?.name || user?.email)}
            </div>
            <div className="leading-tight hidden sm:block">
                <div className="text-sm font-medium truncate max-w-[140px]">{title}</div>
                {subtitle && <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">{subtitle}</div>}
            </div>
        </div>
    );
}
