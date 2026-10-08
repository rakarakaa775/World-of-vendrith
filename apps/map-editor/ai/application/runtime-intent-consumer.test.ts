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
  it("rejects editor JSON without a runtimeAction", async () => {
    resolve.mockResolvedValue({ row: { id: "map-1", world_id: "world-1" }, document: { id: "map-1", mapType: "world" } as never, version: 8 } as never);
    const executor = { execute: vi.fn() };
    const result = await createRuntimeIntentConsumer(client({ ok: true, intent_id: "intent-2", proposal_id: "proposal-2", context_type: "world", context_id: "map-1", runtime_surface: "game", action: { operation: "move", mapId: "map-1" } }), executor).consume("intent-2");
    expect(result).toMatchObject({ ok: false, status: "rejected", result: { code: "RUNTIME_ACTION_REQUIRED" } });
    expect(executor.execute).not.toHaveBeenCalled();
  });
});