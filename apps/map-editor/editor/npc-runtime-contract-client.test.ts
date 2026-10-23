import { describe, expect, it, vi } from "vitest";
import { persistNpcRuntimeContract } from "./npc-runtime-contract-client";

describe("persistNpcRuntimeContract", () => {
  it("sends an explicit save with the authenticated bearer token and returns confirmed persistence", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ saved: true, seedKey: "npc-guard-01", updatedAt: "2026-10-22T10:00:00.000Z" }), { status: 200 }));
    const contract = { version: 1, traversalCapabilities: { canSwim: true, hasWaterTransport: false } };
    await expect(persistNpcRuntimeContract("token-123", " npc-guard-01 ", contract, request)).resolves.toEqual({ saved: true, seedKey: "npc-guard-01", updatedAt: "2026-10-22T10:00:00.000Z" });
    expect(request).toHaveBeenCalledWith("/api/npc-runtime-contract", expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer token-123" }, body: JSON.stringify({ seedKey: "npc-guard-01", runtimeContract: contract }) }));
  });

  it("rejects missing auth and malformed contract before making a request", async () => {
    const request = vi.fn<typeof fetch>();
    await expect(persistNpcRuntimeContract("", "npc-1", { version: 1 }, request)).rejects.toThrow("login");
    await expect(persistNpcRuntimeContract("token", "npc-1", null, request)).rejects.toThrow("objek JSON");
    expect(request).not.toHaveBeenCalled();
  });

  it("surfaces server validation and authorization errors", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ error: "NPC seed key tidak ditemukan." }), { status: 404 }));
    await expect(persistNpcRuntimeContract("token", "missing-seed", { version: 1 }, request)).rejects.toThrow("NPC seed key tidak ditemukan.");
  });
});
