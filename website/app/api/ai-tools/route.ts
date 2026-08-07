import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];

async function callGemini(prompt: string): Promise<string> {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`${BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
      if (res.status === 429) await new Promise(r => setTimeout(r, (attempt + 1) * 1500));
    }
  }
  throw new Error("Gemini unavailable");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body; // type: "invoice" | "flight-risk" | "product-search"

    if (type === "invoice") {
      const { text } = data;
      const result = await callGemini(`Extract invoice details from this text and respond ONLY as valid JSON:
Text: "${text}"
JSON format: {"vendorName":"<name>","amount":"<$X.XX>","currency":"<USD/INR/EUR>","dueDate":"<YYYY-MM-DD>","invoiceNumber":"<inv#>","description":"<service/product>","paymentMethod":"<bank/crypto>","algoAmount":"<estimated ALGO equivalent>"}`);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return NextResponse.json(jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "parse_failed", raw: result });
    }

    if (type === "product-search") {
      const { query, budget } = data;
      const result = await callGemini(`You are a product search AI. Find 3 realistic product listings for: "${query}" under $${budget}.
Respond ONLY as valid JSON array:
[{"name":"<exact product name>","vendor":"<Amazon/eBay/Walmart/Best Buy>","price":"$<X.XX>","rating":<4.0-5.0>,"reviews":<number>,"inStock":true,"deliveryDays":<1-10>,"imageKeyword":"<search keyword for product image>"},...]`);
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      return NextResponse.json(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
