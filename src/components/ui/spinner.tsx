// src/components/ui/spinner.tsx
"use client";

import * as React from "react";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-6 animate-spin", className)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
    </div>
  );
}

export function FullscreenSpinner({
  label = "Verificando sessão…",
}: { label?: string }) {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        <span>{label}</span>
      </div>
    </div>
  );
}
