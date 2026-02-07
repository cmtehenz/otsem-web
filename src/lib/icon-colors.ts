/**
 * Unified icon + color mapping for the entire customer app.
 *
 * Every place that renders a transaction-type icon, a quick-action icon, or an
 * action-sheet icon should import from here so we have ONE source of truth.
 *
 * Background opacity is standardised to `/10` for light tints; icon colours use
 * the matching 400-level Tailwind shade so they pop on dark glass surfaces.
 */

// ─── Action / Transaction type keys ──────────────────────
export type IconType =
    | "deposit"
    | "withdraw"
    | "conversion"
    | "transfer"
    | "send"
    | "sell"
    | "boleto"
    | "pending"
    | "empty"
    | "neutral";

export type IconColorEntry = {
    /** Tailwind `bg-*` class for the icon container */
    bg: string;
    /** Tailwind `text-*` class for the icon itself */
    text: string;
};

/**
 * Canonical colour map.
 *
 * Usage:
 * ```tsx
 * import { iconColors } from "@/lib/icon-colors";
 * const c = iconColors.deposit;
 * <div className={`${c.bg} ${c.text}`}><ArrowDownLeft /></div>
 * ```
 */
export const iconColors: Record<IconType, IconColorEntry> = {
    deposit: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
    },
    withdraw: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
    },
    conversion: {
        bg: "bg-violet-400/10",
        text: "text-violet-400",
    },
    transfer: {
        bg: "bg-purple-400/10",
        text: "text-purple-300",
    },
    send: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
    },
    sell: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
    },
    boleto: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
    },
    pending: {
        bg: "bg-white/8",
        text: "text-white/60",
    },
    empty: {
        bg: "bg-white/6",
        text: "text-white/40",
    },
    neutral: {
        bg: "bg-white/10",
        text: "text-white",
    },
};

/** Standard icon container size classes (for quick-action circles, etc.) */
export const iconContainerClass = "w-10 h-10 rounded-2xl flex items-center justify-center";

/** Standard small icon container (for transaction rows, etc.) */
export const iconContainerSmClass = "w-9 h-9 rounded-xl flex items-center justify-center";

/**
 * Map a transaction type + status to an IconType key.
 *
 * Keeps the business-logic → visual mapping in one place.
 */
export function resolveTransactionIcon(
    type: string,
    status?: string,
    subType?: string | null,
): IconType {
    if (status === "PENDING" || status === "PROCESSING") return "pending";

    switch (type) {
        case "PIX_IN":
            return "deposit";
        case "PIX_OUT":
            return "withdraw";
        case "CONVERSION":
            return subType === "SELL" ? "sell" : "conversion";
        case "TRANSFER":
            return "transfer";
        default:
            return "neutral";
    }
}
