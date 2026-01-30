import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl");
        const data = await response.json();
        if (data.tether?.brl) {
            const baseRate = data.tether.brl;
            const rateWithMarkup = baseRate * 1.0098;
            res.status(200).json({ rate: rateWithMarkup });
        } else {
            throw new Error("Failed to fetch CoinGecko rate");
        }
    } catch {
        res.status(500).json({ rate: null });
    }
}