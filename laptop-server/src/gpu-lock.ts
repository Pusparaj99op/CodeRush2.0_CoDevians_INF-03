// Single-flight gate over the GPU.
//
// The RTX 4050 has 8GB of VRAM — enough for one quantized model doing one
// thing at a time. Rather than let concurrent requests thrash the card (or
// OOM mid-demo), we admit exactly one inference and reject the rest with a
// 503 the orchestrator can retry. Doc/specs/03-laptop-server.md documents
// this as a known limitation; making it explicit beats discovering it live.

let busy = false;
let inFlightSince: number | null = null;

export class GpuBusyError extends Error {
  readonly busyForMs: number;

  constructor(busyForMs: number) {
    super("GPU is already serving another inference request");
    this.name = "GpuBusyError";
    this.busyForMs = busyForMs;
  }
}

export function isBusy(): boolean {
  return busy;
}

/**
 * Runs `fn` if the GPU is free, otherwise throws `GpuBusyError`. Callers
 * are never queued: a queue would turn a fast failure into an unbounded
 * wait behind a tunnel that may already be dead.
 */
export async function withGpu<T>(fn: () => Promise<T>): Promise<T> {
  if (busy) {
    throw new GpuBusyError(Date.now() - (inFlightSince ?? Date.now()));
  }

  busy = true;
  inFlightSince = Date.now();
  try {
    return await fn();
  } finally {
    busy = false;
    inFlightSince = null;
  }
}
