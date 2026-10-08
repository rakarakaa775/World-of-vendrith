import { describe, expect, it, vi } from "vitest";
import { createSupabaseRuntimeIntentExecutor } from "./supabase-runtime-intent-executor";

function client(overrides: Record<string, unknown> = {}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === "acquire_world_runtime_lease_v1") return { data: [{ acquired: true }], error: null };
    if (name === "append_world_runtime_mutation_batch_v1") return {
      data: [{ sequence: 4, state_hash: "journal-hash" }],
      error: null,
    };
    if (name === "save_world_runtime_checkpoint_v1") return { data: null, error: null };
    return { data: null, error: null };
  });
  return Object.assign({ rpc }, overrides);
}

describe("supabase runtime intent executor", () => {
  it("rejects before journal when runtime lease is unavailable", async () => {
    const supabase = client({
      rpc: vi.fn(async (name: string) =>
        name === "acquire_world_runtime_lease_v1"
          ? { data: [{ acquired: false }], error: null }
          : { data: null, error: null }),
    });
    const executor = createSupabaseRuntimeIntentExecutor(supabase as never);
    const result = await executor.execute({
      intent: { intentId: "intent-1", proposalId: "proposal-1", contextType: "world", contextId: "world-1", runtimeSurface: "game", action: {} },
      request: {} as never,
      action: { id: "action-1", intelligence: "world", type: "noop", payload: {}, risk: "safe", reason: "test" } as never,
    });
    expect(result.ok).toBe(false);
    expect(result.result.code).toBe("RUNTIME_LEASE_UNAVAILABLE");
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });

  it("treats checkpoint failure as retryable after the durable journal append", async () => {
    const calls: string[] = [];
    const supabase = client({
      rpc: vi.fn(async (name: string) => {
        calls.push(name);
        if (name === "acquire_world_runtime_lease_v1") return { data: [{ acquired: true }], error: null };
        if (name === "append_world_runtime_mutation_batch_v1") return { data: [{ sequence: 4, state_hash: "journal-hash" }], error: null };
        if (name === "save_world_runtime_checkpoint_v1") return { data: null, error: { message: "checkpoint unavailable" } };
        return { data: null, error: null };
      }),
    });
    const executor = createSupabaseRuntimeIntentExecutor(supabase as never);
    expect(calls).toEqual([]);
  });
});
