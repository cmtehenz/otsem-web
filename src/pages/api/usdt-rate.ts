import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch("https://www.okx.com/api/v5/market/ticker?instId=USDT-BRL");
        const data = await response.json();
        if (data.code === "0" && data.data?.[0]?.last) {
            const baseRate = parseFloat(data.data[0].last);
            const rateWithMarkup = baseRate * 1.0098;
            res.status(200).json({ rate: rateWithMarkup });
        } else {
            throw new Error("Failed to fetch OKX rate");
        }
    } catch {
        res.status(500).json({ rate: null });
    }
}