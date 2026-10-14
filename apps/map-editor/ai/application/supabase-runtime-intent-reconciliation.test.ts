import { describe, expect, it, vi } from "vitest";
import { reconcileSupabaseRuntimeIntent } from "./supabase-runtime-intent-reconciliation";

describe("Supabase runtime intent reconciliation", () => {
  it("calls the durable reconciliation RPC for an intent", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { ok: true, status: "consumed", reconciled: true, verified: true, checkpointSaved: true },
      error: null,
    });
    const result = await reconcileSupabaseRuntimeIntent({ rpc } as never, "intent-1");

    expect(rpc).toHaveBeenCalledWith("reconcile_vendrith_runtime_intent_v1", { p_intent_id: "intent-1" });
    expect(result).toMatchObject({ ok: true, status: "consumed", reconciled: true, verified: true });
  });

  it("rejects an empty intent ID without calling Supabase", async () => {
    const rpc = vi.fn();
    await expect(reconcileSupabaseRuntimeIntent({ rpc } as never, "  ")).resolves.toEqual({
      ok: false,
      code: "INTENT_ID_REQUIRED",
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("surfaces RPC errors", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "permission denied" } });
    await expect(reconcileSupabaseRuntimeIntent({ rpc } as never, "intent-2"))
      .rejects.toThrow("RUNTIME_INTENT_RECONCILIATION_ERROR: permission denied");
  });

  it("rejects malformed RPC responses", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { status: "consumed" }, error: null });
    await expect(reconcileSupabaseRuntimeIntent({ rpc } as never, "intent-3"))
      .rejects.toThrow("RUNTIME_INTENT_RECONCILIATION_INVALID_RESPONSE");
  });
});
