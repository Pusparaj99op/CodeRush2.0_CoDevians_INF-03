// Thin wrapper over a local Ollama server running on the RTX 4050.
// See Doc/specs/03-laptop-server.md "Stack".

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

interface OllamaGenerateResponse {
  response: string;
  eval_count?: number;
  eval_duration?: number;
}

export interface InferenceResult {
  output: string;
  model: string;
  tokensGenerated: number | null;
  durationMs: number | null;
}

/**
 * Runs one inference call against the local Ollama server. Kept to a
 * single non-streaming request — the RTX 4050's 8GB VRAM is only sized
 * for one concurrent request during the demo (see spec's GPU note).
 */
export async function runInference(task: string, input: string): Promise<InferenceResult> {
  const prompt = `Task: ${task}\n\nInput:\n${input}`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  return {
    output: data.response,
    model: OLLAMA_MODEL,
    tokensGenerated: data.eval_count ?? null,
    durationMs: data.eval_duration ? Math.round(data.eval_duration / 1_000_000) : null,
  };
}
