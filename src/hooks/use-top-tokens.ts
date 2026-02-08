"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type CoinMarketData = {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number | null;
    low_24h: number | null;
    price_change_24h: number | null;
    price_change_percentage_24h: number | null;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    last_updated: string;
};

type UseTopTokensOptions = {
    currency?: "usd" | "brl";
    perPage?: number;
    refreshInterval?: number;
};

type TopTokensResponse = {
    tokens: CoinMarketData[];
    updatedAt: number;
    stale?: boolean;
    source?: "coingecko" | "cache" | "stale-cache";
};

export function useTopTokens(options: UseTopTokensOptions = {}) {
    const {
        currency = "usd",
        perPage = 100,
        refreshInterval = 60_000,
    } = options;

    const [tokens, setTokens] = useState<CoinMarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchTokens = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setError(null);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const url = `/market-data/top-tokens?currency=${currency}&perPage=${perPage}`;
            const res = await fetch(url, { signal: controller.signal });

            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error("RATE_LIMITED");
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const payload: TopTokensResponse = await res.json();
            setTokens(payload.tokens || []);
            setUpdatedAt(payload.updatedAt || Date.now());
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            const message = err instanceof Error ? err.message : "Failed to fetch tokens";
            setError(message);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [currency, perPage]);

    useEffect(() => {
        fetchTokens(true);
        const interval = setInterval(() => fetchTokens(false), refreshInterval);
        return () => {
            clearInterval(interval);
            abortRef.current?.abort();
        };
    }, [fetchTokens, refreshInterval]);

    const refresh = useCallback(() => fetchTokens(true), [fetchTokens]);

    return { tokens, loading, error, updatedAt, refresh };
}
