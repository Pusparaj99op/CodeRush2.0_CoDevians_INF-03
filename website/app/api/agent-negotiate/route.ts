import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(prompt: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`${BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
      if (res.status === 429) await new Promise(r => setTimeout(r, (attempt + 1) * 1500));
    }
  }
  throw new Error("All Gemini models failed");
}

export async function POST(req: NextRequest) {
  try {
    const { product, budget } = await req.json();

    // Run 3 agents in parallel with different optimization goals
    const [priceResult, deliveryResult, qualityResult] = await Promise.allSettled([
      callGemini(`You are Agent PRICE — a procurement AI that finds the absolute lowest price.
Product to procure: "${product}" with budget of $${budget} USD.
Respond ONLY as valid JSON: {"agentName":"Agent PRICE","emoji":"💰","strategy":"Lowest Price","vendorName":"<realistic vendor name>","price":"<price like $X.XX>","deliveryDays":<number>,"rating":<4.0-5.0>,"highlights":["<benefit1>","<benefit2>","<benefit3>"],"confidence":<70-99>}`),

      callGemini(`You are Agent SPEED — a procurement AI that finds the fastest delivery option.
Product to procure: "${product}" with budget of $${budget} USD.
Respond ONLY as valid JSON: {"agentName":"Agent SPEED","emoji":"⚡","strategy":"Fastest Delivery","vendorName":"<realistic vendor name>","price":"<price like $X.XX>","deliveryDays":<number>,"rating":<4.0-5.0>,"highlights":["<benefit1>","<benefit2>","<benefit3>"],"confidence":<70-99>}`),

      callGemini(`You are Agent QUALITY — a procurement AI that finds the best quality and warranty.
Product to procure: "${product}" with budget of $${budget} USD.
Respond ONLY as valid JSON: {"agentName":"Agent QUALITY","emoji":"⭐","strategy":"Best Quality","vendorName":"<realistic vendor name>","price":"<price like $X.XX>","deliveryDays":<number>,"rating":<4.0-5.0>,"highlights":["<benefit1>","<benefit2>","<benefit3>"],"confidence":<70-99>}`),
    ]);

    const parseAgent = (result: PromiseSettledResult<string>, fallback: object) => {
      if (result.status === "rejected") return fallback;
      try {
        const text = result.value;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : fallback;
      } catch {
        return fallback;
      }
    };

    const agents = [
      parseAgent(priceResult, { agentName: "Agent PRICE", emoji: "💰", strategy: "Lowest Price", vendorName: "DealHub Global", price: `$${(budget * 0.75).toFixed(2)}`, deliveryDays: 7, rating: 4.2, highlights: ["Best price guarantee", "Free returns", "Trusted seller"], confidence: 82 }),
      parseAgent(deliveryResult, { agentName: "Agent SPEED", emoji: "⚡", strategy: "Fastest Delivery", vendorName: "ExpressShip Pro", price: `$${(budget * 0.90).toFixed(2)}`, deliveryDays: 2, rating: 4.5, highlights: ["2-day express", "Real-time tracking", "Priority handling"], confidence: 88 }),
      parseAgent(qualityResult, { agentName: "Agent QUALITY", emoji: "⭐", strategy: "Best Quality", vendorName: "AuthentiStore", price: `$${(budget * 0.95).toFixed(2)}`, deliveryDays: 5, rating: 4.9, highlights: ["2-year warranty", "Authentic certified", "Premium packaging"], confidence: 91 }),
    ];

    // Determine winner (highest confidence)
    const winner = agents.reduce((best, a) =>
      (a.confidence ?? 0) > (best.confidence ?? 0) ? a : best
    );

    return NextResponse.json({ agents, winner, product, budget });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
