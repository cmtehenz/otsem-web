import { useEffect, useState } from "react";

export function useUsdtRate() {
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState(Date.now());

    async function fetchRate() {
        setLoading(true);
        try {
            const res = await fetch("/api/usdt-rate");
            const data = await res.json();
            setRate(data.rate ?? null);
            setUpdatedAt(Date.now()); // atualiza o timestamp
        } catch {
            setRate(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRate();
        const interval = setInterval(fetchRate, 15000);
        return () => clearInterval(interval);
    }, []);

    return { rate, loading, updatedAt };
}