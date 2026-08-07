// Thin wrapper over a local Ollama server running on the RTX 4050.
// See Doc/specs/03-laptop-server.md "Stack".

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

/** Hard ceiling on generated tokens, so one request can't run away. */
const MAX_TOKENS = Number(process.env.OLLAMA_MAX_TOKENS ?? 512);

/** Abort an inference that outlives the demo's patience. */
const INFERENCE_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? 120_000);

/** Much shorter budget for the liveness probe. */
const PROBE_TIMEOUT_MS = Number(process.env.OLLAMA_PROBE_TIMEOUT_MS ?? 2_000);

interface OllamaGenerateResponse {
  response: string;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaTagsResponse {
  models?: { name: string }[];
}

export interface InferenceResult {
  output: string;
  model: string;
  tokensGenerated: number | null;
  durationMs: number | null;
}

export interface OllamaStatus {
  reachable: boolean;
  /** True when `OLLAMA_MODEL` is actually pulled and ready to serve. */
  modelReady: boolean;
  models: string[];
  reason?: string;
}

export class OllamaUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OllamaUnavailableError";
  }
}

/**
 * Probes the local Ollama server. Used by `GET /health`, which the
 * marketplace treats as this provider's liveness check — so it has to
 * reflect whether we can actually serve, not just whether the HTTP
 * wrapper's event loop is alive.
 */
export async function checkOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { reachable: false, modelReady: false, models: [], reason: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as OllamaTagsResponse;
    const models = (data.models ?? []).map((m) => m.name);
    // Ollama reports fully-qualified tags ("llama3.2:3b"); accept a bare
    // model name too so `OLLAMA_MODEL=llama3.2` still matches.
    const modelReady = models.some(
      (name) => name === OLLAMA_MODEL || name.split(":")[0] === OLLAMA_MODEL.split(":")[0]
    );

    return {
      reachable: true,
      modelReady,
      models,
      reason: modelReady ? undefined : `model ${OLLAMA_MODEL} not pulled (ollama pull ${OLLAMA_MODEL})`,
    };
  } catch (err) {
    return { reachable: false, modelReady: false, models: [], reason: (err as Error).message };
  }
}

/**
 * Runs one inference call against the local Ollama server. Kept to a
 * single non-streaming request — the RTX 4050's 8GB VRAM is only sized
 * for one concurrent request during the demo (see spec's GPU note), and
 * the caller is expected to hold the GPU lock in `gpu-lock.ts`.
 */
export async function runInference(task: string, input: string): Promise<InferenceResult> {
  const prompt = `Task: ${task}\n\nInput:\n${input}`;
  const startedAt = Date.now();

  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { num_predict: MAX_TOKENS },
      }),
      signal: AbortSignal.timeout(INFERENCE_TIMEOUT_MS),
    });
  } catch (err) {
    throw new OllamaUnavailableError(
      `could not reach Ollama at ${OLLAMA_URL}: ${(err as Error).message}`
    );
  }

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  return {
    output: data.response,
    model: OLLAMA_MODEL,
    tokensGenerated: data.eval_count ?? null,
    // Prefer Ollama's own nanosecond timing; fall back to wall clock.
    durationMs: data.eval_duration
      ? Math.round(data.eval_duration / 1_000_000)
      : Date.now() - startedAt,
  };
}

export const ollamaConfig = {
  url: OLLAMA_URL,
  model: OLLAMA_MODEL,
  maxTokens: MAX_TOKENS,
  timeoutMs: INFERENCE_TIMEOUT_MS,
};
