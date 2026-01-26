import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const yahooRes = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/USDBRL=X?interval=1m&range=1d");
        const data = await yahooRes.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        res.status(200).json({ rate: price ?? null });
    } catch {
        res.status(500).json({ rate: null });
    }
}