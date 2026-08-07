import assert from "node:assert/strict";
import { test } from "node:test";
import { GpuBusyError, isBusy, withGpu } from "./gpu-lock";

const defer = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
};

test("admits one inference at a time and rejects the rest", async () => {
  const gate = defer();
  const first = withGpu(async () => {
    await gate.promise;
    return "first";
  });

  assert.equal(isBusy(), true);
  await assert.rejects(withGpu(async () => "second"), GpuBusyError);

  gate.resolve();
  assert.equal(await first, "first");
  assert.equal(isBusy(), false);
});

test("releases the lock when the inference throws", async () => {
  await assert.rejects(
    withGpu(async () => {
      throw new Error("ollama exploded");
    }),
    /ollama exploded/
  );
  assert.equal(isBusy(), false);
  assert.equal(await withGpu(async () => "ok"), "ok");
});
