import { NextRequest, NextResponse } from "next/server";

// CoinGecko free API — no key required
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get("amount") ?? "1");
  const base = searchParams.get("base") ?? "algorand"; // "algorand" | "stellar"

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${base}&vs_currencies=usd,inr,eur,gbp,sgd`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();
    const rates = data[base];
    return NextResponse.json({
      base,
      amount,
      rates: {
        USD: +(amount * rates.usd).toFixed(2),
        INR: +(amount * rates.inr).toFixed(2),
        EUR: +(amount * rates.eur).toFixed(2),
        GBP: +(amount * rates.gbp).toFixed(2),
        SGD: +(amount * rates.sgd).toFixed(2),
      },
      unitRates: rates,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Fallback static rates if CoinGecko is down
    return NextResponse.json({
      base,
      amount,
      rates: {
        USD: +(amount * 0.19).toFixed(2),
        INR: +(amount * 15.8).toFixed(2),
        EUR: +(amount * 0.17).toFixed(2),
        GBP: +(amount * 0.15).toFixed(2),
        SGD: +(amount * 0.26).toFixed(2),
      },
      unitRates: { usd: 0.19, inr: 15.8, eur: 0.17, gbp: 0.15, sgd: 0.26 },
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
}
