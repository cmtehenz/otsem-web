// src/components/auth/RoleGuard.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SpinnerCustom } from "@/components/ui/spinner";

type Props = {
  roles: Array<"ADMIN" | "CUSTOMER">;
  children: React.ReactNode;
  redirectTo?: string;
};

export function RoleGuard({ roles, children, redirectTo = "/login" }: Props) {
  const { loading, user } = useAuth(); // was isLoading
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const ok = roles.includes(user.role);
    if (!ok) router.replace(redirectTo);
  }, [loading, user, roles, router, redirectTo]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <SpinnerCustom />
      </div>
    );
  }

  return <>{children}</>;
}
