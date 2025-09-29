"use client";

import { apiPost } from "@/lib/api";

export async function doLogout() {
    try {
        await apiPost("/auth/logout", {});
    } catch {
        // mesmo se falhar, vamos limpar client-side por garantia
        try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("current_user");
        } catch { }
    }
}
