import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Models available for this key (confirmed by API probe)
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];

const SYSTEM_PROMPT = `You are Veldar AI — a smart, concise financial assistant for the Veldar platform.
Veldar is an AI-powered agent that automates cross-border B2B payments using blockchain (Stellar, Algorand) and the x402 protocol.
Help users understand Veldar's features: compile invoices, get quotes, approve, pay, verify and settle transactions.
Keep answers short, sharp and helpful. Use bullet points when listing items. Stay on-brand: professional but approachable.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const contents = messages
      .filter((m: { role: string; content: string }) => m.content?.trim())
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const errors: string[] = [];

    for (const model of MODELS) {
      const url = `${BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

      // Try up to 3 times for 429 (rate limit)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          });

          const bodyText = await res.text();

          if (res.ok) {
            const data = JSON.parse(bodyText);
            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
            return NextResponse.json({ text });
          }

          if (res.status === 429) {
            // Rate limited — wait and retry
            const retryAfter = res.headers.get("Retry-After");
            const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 2000;
            console.warn(`Rate limited on ${model}, attempt ${attempt + 1}, waiting ${waitMs}ms`);
            await sleep(waitMs);
            continue;
          }

          // Other error — move to next model
          errors.push(`[${model}] ${res.status}: ${bodyText.slice(0, 300)}`);
          break;
        } catch (fetchErr) {
          errors.push(`[${model} fetch] ${String(fetchErr)}`);
          break;
        }
      }
    }

    console.error("All Gemini models failed:", errors);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable due to rate limits. Please try again in a few seconds.",
        details: errors,
      },
      { status: 503 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Chat route exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
