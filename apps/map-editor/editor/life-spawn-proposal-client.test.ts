import { describe, expect, it, vi } from "vitest";
import { approveLifeSpawnProposal, createLifeSpawnProposal, executeApprovedLifeSpawnIntent } from "./life-spawn-proposal-client";

describe("Life spawn proposal client", () => {
  it("requires an authenticated session before proposing", async () => {
    await expect(createLifeSpawnProposal(" ", { mapId: "playable-1", life: {}, x: 0, y: 0 }, vi.fn() as typeof fetch)).rejects.toThrow("login");
  });

  it("rejects non-integer tile coordinates locally", async () => {
    await expect(createLifeSpawnProposal("token", { mapId: "playable-1", life: {}, x: 1.5, y: 0 }, vi.fn() as typeof fetch)).rejects.toThrow("integer");
  });

  it("returns only a validated pending proposal response", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ proposalId: "proposal-1", sessionId: "session-1", mapId: "playable-1", worldId: "world-1", mapVersion: 3, status: "pending_approval" }), { status: 201 }));
    const result = await createLifeSpawnProposal("token", { mapId: "playable-1", life: { id: "life-1" }, x: 2, y: 4 }, request as typeof fetch);
    expect(result).toMatchObject({ proposalId: "proposal-1", mapId: "playable-1", worldId: "world-1", status: "pending_approval" });
    expect(request).toHaveBeenCalledWith("/api/life-spawn-proposals", expect.objectContaining({ method: "POST" }));
  });

  it("surfaces proposal errors", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Map not found" }), { status: 422 }));
    await expect(createLifeSpawnProposal("token", { mapId: "playable-1", life: {}, x: 0, y: 0 }, request as typeof fetch)).rejects.toThrow("Map not found");
  });

  it("keeps approval as a separate explicit request", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, runtimeIntent: { ok: true } }), { status: 200 }));
    await expect(approveLifeSpawnProposal("token", "proposal-1", request as typeof fetch)).resolves.toMatchObject({ ok: true });
    expect(request).toHaveBeenCalledWith("/api/vendrith-ai", expect.objectContaining({ body: JSON.stringify({ approve: true, proposalId: "proposal-1" }) }));
  });
});


describe("approved Life runtime intent execution", () => {
  it("requires a UUID-shaped intent id", async () => {
    await expect(executeApprovedLifeSpawnIntent("token", "not-an-id", vi.fn() as typeof fetch)).rejects.toThrow("ID runtime intent");
  });

  it("executes only the supplied intent through the runtime boundary", async () => {
    const intentId = "123e4567-e89b-12d3-a456-426614174000";
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, status: "consumed", result: { verified: true } }), { status: 200 }));
    await expect(executeApprovedLifeSpawnIntent("token", intentId, request as typeof fetch)).resolves.toMatchObject({ ok: true, status: "consumed" });
    expect(request).toHaveBeenCalledWith("/api/vendrith-runtime-intents", expect.objectContaining({ body: JSON.stringify({ intentId }) }));
  });
});
