import { useEffect, useState, useCallback, useRef } from "react";

const POLL_INTERVAL_MS = 30_000; // 30s instead of 15s

export function useUsdtRate() {
    const [buyRate, setBuyRate] = useState<number | null>(null);
    const [sellRate, setSellRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState(Date.now());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchRate = useCallback(async () => {
        try {
            const res = await fetch(`/api/public/quote`);
            const data = await res.json();
            setBuyRate(data.buyRate ?? null);
            setSellRate(data.sellRate ?? null);
            setUpdatedAt(Date.now());
        } catch {
            // Keep previous values on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const startPolling = () => {
            if (intervalRef.current) return;
            fetchRate();
            intervalRef.current = setInterval(fetchRate, POLL_INTERVAL_MS);
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibility = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [fetchRate]);

    return { buyRate, sellRate, loading, updatedAt };
}
