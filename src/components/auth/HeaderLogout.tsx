"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function HeaderLogout() {
    const { logout } = useAuth()
    const router = useRouter()

    function handleLogout() {
        logout()
        router.push("/login") // volta para login após sair
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="ml-auto"
            title="Sair da conta"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    )
}
