import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

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

    // Fail fast if no API key configured
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 503 }
      );
    }

    const contents = messages
      .filter((m: { role: string; content: string }) => m.content?.trim())
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const errors: string[] = [];

    for (const model of MODELS) {
      const url = `${BASE}/${model}:generateContent`;

      // Try up to 3 times — only retry on 429 (rate limit)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

          let res: Response;
          try {
            res = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
              },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
              }),
            });
          } finally {
            clearTimeout(timeout);
          }

          const bodyText = await res.text();

          if (res.ok) {
            const data = JSON.parse(bodyText);
            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
            return NextResponse.json({ text });
          }

          // 401 / 403 — try next model (AQ. keys may have per-model restrictions)
          if (res.status === 401 || res.status === 403) {
            console.warn(`Auth error on ${model} (${res.status}), trying next model...`);
            errors.push(`[${model}] ${res.status}: ${bodyText.slice(0, 100)}`);
            break;
          }

          // 429 — rate limited, exponential backoff then retry
          if (res.status === 429) {
            const retryAfter = res.headers.get("Retry-After");
            const backoffMs = Math.pow(2, attempt) * 1500; // 1.5s, 3s, 6s
            const waitMs = retryAfter
              ? Math.min(parseInt(retryAfter) * 1000, 10_000)
              : backoffMs;
            console.warn(`Rate limited on ${model}, attempt ${attempt + 1}, waiting ${waitMs}ms`);
            await sleep(waitMs);
            continue;
          }

          // Other error — move to next model immediately
          errors.push(`[${model}] ${res.status}: ${bodyText.slice(0, 200)}`);
          break;
        } catch (fetchErr) {
          const msg = String(fetchErr);
          if (msg.includes("abort")) {
            errors.push(`[${model}] Request timed out after 10s`);
          } else {
            errors.push(`[${model} fetch] ${msg}`);
          }
          break;
        }
      }
    }

    console.error("All Gemini models failed:", errors);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable. Please try again in a few seconds.",
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

