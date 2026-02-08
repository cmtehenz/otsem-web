import { NextResponse } from "next/server";

type CoinMarketData = {
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

type CacheEntry = {
  tokens: CoinMarketData[];
  updatedAt: number;
};

const cache = new Map<string, CacheEntry>();
const FRESH_MS = 30_000;
const MAX_STALE_MS = 10 * 60_000;

class UpstreamHttpError extends Error {
  status: number;

  constructor(status: number) {
    super(`UPSTREAM_HTTP_${status}`);
    this.status = status;
  }
}

function cacheKey(currency: string, perPage: number) {
  return `${currency}:${perPage}`;
}

function parseCurrency(value: string | null): "usd" | "brl" {
  return value === "brl" ? "brl" : "usd";
}

function parsePerPage(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 15;
  return Math.min(Math.floor(parsed), 100);
}

async function fetchTopTokens(
  currency: "usd" | "brl",
  perPage: number,
): Promise<CoinMarketData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "otsem-pay-market-proxy/1.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new UpstreamHttpError(res.status);
    }

    const data = (await res.json()) as CoinMarketData[];
    if (!Array.isArray(data)) {
      throw new Error("UPSTREAM_INVALID_PAYLOAD");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = parseCurrency(searchParams.get("currency"));
  const perPage = parsePerPage(searchParams.get("perPage"));
  const key = cacheKey(currency, perPage);
  const now = Date.now();
  const current = cache.get(key);

  if (current && now - current.updatedAt < FRESH_MS) {
    return NextResponse.json({
      tokens: current.tokens,
      updatedAt: current.updatedAt,
      stale: false,
      source: "cache",
    });
  }

  try {
    const tokens = await fetchTopTokens(currency, perPage);
    const updatedAt = Date.now();
    cache.set(key, { tokens, updatedAt });

    return NextResponse.json({
      tokens,
      updatedAt,
      stale: false,
      source: "coingecko",
    });
  } catch (error: unknown) {
    const stale = cache.get(key);
    if (stale && now - stale.updatedAt < MAX_STALE_MS) {
      return NextResponse.json({
        tokens: stale.tokens,
        updatedAt: stale.updatedAt,
        stale: true,
        source: "stale-cache",
      });
    }

    const upstreamStatus =
      error instanceof UpstreamHttpError ? error.status : 502;

    return NextResponse.json(
      {
        error:
          upstreamStatus === 429
            ? "RATE_LIMITED"
            : "UPSTREAM_UNAVAILABLE",
      },
      { status: upstreamStatus === 429 ? 429 : 502 },
    );
  }
}
