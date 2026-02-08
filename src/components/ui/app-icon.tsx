import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppIconSize = "xs" | "sm" | "md" | "lg" | "nav";

const sizeClassByKey: Record<AppIconSize, string> = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-[18px] h-[18px]",
    lg: "w-5 h-5",
    nav: "w-[22px] h-[22px]",
};

const strokeByKey: Record<AppIconSize, number> = {
    xs: 2.2,
    sm: 2.1,
    md: 2,
    lg: 2,
    nav: 2,
};

type AppIconProps = {
    icon: LucideIcon;
    size?: AppIconSize;
    className?: string;
    strokeWidth?: number;
};

/**
 * Canonical icon renderer for customer-app surfaces.
 * Keeps stroke weight and geometry consistent across cards, tabs and sheets.
 */
export function AppIcon({
    icon: Icon,
    size = "md",
    className,
    strokeWidth,
}: AppIconProps) {
    return (
        <Icon
            className={cn(sizeClassByKey[size], className)}
            strokeWidth={strokeWidth ?? strokeByKey[size]}
        />
    );
}
