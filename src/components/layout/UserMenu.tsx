"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { doLogout } from "@/lib/auth";
import { toast } from "sonner";

export default function UserMenu() {
    const router = useRouter();

    async function handleLogout() {
        // await doLogout();
        toast.success("Você saiu da sua conta.");
        router.replace("/login");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">Aline G.</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="h-4 w-4 mr-2" /> Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/support")}>
                    <HelpCircle className="h-4 w-4 mr-2" /> Suporte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
