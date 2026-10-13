import { describe, expect, it, vi } from "vitest";
import { createRuntimeIntentConsumer } from "./runtime-intent-consumer";
import { resolveAuthoritativeMap } from "../../editor/map-authoritative-resolver";

vi.mock("../../editor/map-authoritative-resolver", () => ({ resolveAuthoritativeMap: vi.fn() }));
const resolve = vi.mocked(resolveAuthoritativeMap);
function client(data: unknown) {
  const rpc = vi.fn().mockResolvedValueOnce({ data, error: null }).mockResolvedValueOnce({ data: { ok: true }, error: null });
  return { rpc } as never;
}

describe("runtime intent consumer", () => {
  it("passes a canonical runtimeAction to the injected authoritative executor", async () => {
    resolve.mockResolvedValue({ row: { id: "map-1", world_id: "world-1" }, document: { id: "map-1", mapType: "world" } as never, version: 7 } as never);
    const executor = { execute: vi.fn().mockResolvedValue({ ok: true, result: { stateVersion: "state-2" } }) };
    const result = await createRuntimeIntentConsumer(client({ ok: true, intent_id: "intent-1", proposal_id: "proposal-1", context_type: "world", context_id: "map-1", runtime_surface: "game", action: { runtimeAction: { id: "a1", intelligence: "world", type: "world.schedule_event", payload: {}, risk: "game-rule", reason: "Schedule rain." } } }), executor).consume("intent-1");
    expect(result).toMatchObject({ ok: true, status: "consumed" });
    expect(executor.execute).toHaveBeenCalledWith(expect.objectContaining({ action: expect.objectContaining({ id: "a1" }) }));
  });
  it("does not report a consumed intent when its durable finish write fails", async () => {
    resolve.mockResolvedValue({ row: { id: "map-1", world_id: "world-1" }, document: { id: "map-1", mapType: "world" } as never, version: 9 } as never);
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { ok: true, intent_id: "intent-3", proposal_id: "proposal-3", context_type: "world", context_id: "map-1", runtime_surface: "game", action: { runtimeAction: { id: "a3", intelligence: "world", type: "world.schedule_event", payload: {}, risk: "game-rule", reason: "Schedule fog." } } }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "audit write failed" } });
    const executor = { execute: vi.fn().mockResolvedValue({ ok: true, result: { stateVersion: "state-3" } }) };

    const result = await createRuntimeIntentConsumer({ rpc } as never, executor).consume("intent-3");

    expect(result).toMatchObject({
      ok: false,
      status: "failed",
      result: { code: "RUNTIME_INTENT_FINISH_ERROR", reconciliationRequired: true },
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "finish_vendrith_runtime_intent_v1", expect.objectContaining({
      p_intent_id: "intent-3",
      p_status: "consumed",
    }));
  });

  it("records executor exceptions as failed intents", async () => {
    resolve.mockResolvedValue({ row: { id: "map-1", world_id: "world-1" }, document: { id: "map-1", mapType: "world" } as never, version: 10 } as never);
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { ok: true, intent_id: "intent-4", proposal_id: "proposal-4", context_type: "world", context_id: "map-1", runtime_surface: "game", action: { runtimeAction: { id: "a4", intelligence: "world", type: "world.schedule_event", payload: {}, risk: "game-rule", reason: "Schedule snow." } } }, error: null })
      .mockResolvedValueOnce({ data: { ok: true, status: "failed" }, error: null });
    const executor = { execute: vi.fn().mockRejectedValue(new Error("runtime unavailable")) };

    const result = await createRuntimeIntentConsumer({ rpc } as never, executor).consume("intent-4");

    expect(result).toMatchObject({ ok: false, status: "failed", result: { code: "RUNTIME_INTENT_EXECUTION_ERROR" } });
    expect(rpc).toHaveBeenNthCalledWith(2, "finish_vendrith_runtime_intent_v1", expect.objectContaining({
      p_intent_id: "intent-4",
      p_status: "failed",
    }));
  });

  it("rejects editor JSON without a runtimeAction", async () => {
    resolve.mockResolvedValue({ row: { id: "map-1", world_id: "world-1" }, document: { id: "map-1", mapType: "world" } as never, version: 8 } as never);
    const executor = { execute: vi.fn() };
    const result = await createRuntimeIntentConsumer(client({ ok: true, intent_id: "intent-2", proposal_id: "proposal-2", context_type: "world", context_id: "map-1", runtime_surface: "game", action: { operation: "move", mapId: "map-1" } }), executor).consume("intent-2");
    expect(result).toMatchObject({ ok: false, status: "rejected", result: { code: "RUNTIME_ACTION_REQUIRED" } });
    expect(executor.execute).not.toHaveBeenCalled();
  });
});