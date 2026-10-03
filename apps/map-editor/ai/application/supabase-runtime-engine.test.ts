import { describe, expect, it } from "vitest";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";
import { createSupabaseRuntimeEngine } from "./supabase-runtime-engine";

function adapter() {
  const snapshot: RuntimeWorldSnapshot = {
    state: { worldId: "world-1", clock: { tick: 0, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "engine:1" },
    entities: [
      { id: "npc-1", kind: "npc", mapId: "map-1", position: { x: 0, y: 0 }, state: { name: "Aldren", blocksMovement: true } },
      { id: "npc-2", kind: "npc", mapId: "map-1", position: { x: 0, y: 2 }, state: { name: "Elira", blocksMovement: true } },
      { id: "player-1", kind: "player", mapId: "map-1", position: { x: 2, y: 0 }, state: { blocksMovement: false } },
    ],
  };
  const grid: NavigationGrid = { width: 3, height: 3, blocked: Array(9).fill(false) };
  return { async load(mapId: string) { return mapId === "map-1" ? { snapshot, grid, scheduledEvents: [] } : undefined; } };
}

describe("supabase runtime engine", () => {
  it("runs all NPCs through the engine bridge and preserves runtime state versions", async () => {
    const engine = await createSupabaseRuntimeEngine(adapter() as never, "map-1");
    expect(engine).toBeDefined();
    const result = await engine!.tick([{ id: "festival", startTick: 1, endTick: 3 }], 1);
    expect(result.results).toHaveLength(2);
    expect(result.results.every(item => item.status === "moved")).toBe(true);
    expect(engine!.bridge.snapshot().entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 1, y: 0 });
    expect(engine!.bridge.snapshot().state.stateVersion).toBe("engine:1:runtime:1");
    expect(result.tick).toBe(1);
    expect(result.stateVersion).toBe("engine:1:runtime:1");
    expect(engine!.bridge.snapshot().state.activeEventIds).toEqual(["festival"]);
  });

  it("executes an active scheduled event before NPC ticks", async () => {
    const calls: string[] = [];
    const eventAdapter = {
      async loadCandidates() { calls.push("loadCandidates"); return []; },
      async loadScheduledEvents() { calls.push("loadScheduledEvents"); return [{ id: "festival", startTick: 1, endTick: 3 }]; },
      async loadCandidateById(worldId: string, eventId: string, currentTick: number) {
        calls.push(`candidate:${eventId}`);
        return { id: eventId, worldId, eventType: "world_pause", scheduledAt: "2026-10-03T08:00:00Z", startTick: currentTick, endTick: currentTick + 1 };
      },
      async loadDefinition() {
        return {
          eventType: "world_pause",
          conditionType: "world_status" as const,
          consequenceType: "world_status" as const,
          conditionConfig: { expected_status: "active" },
          consequenceConfig: { target_status: "paused" },
          enabled: true,
        };
      },
      async loadWorldStatus() { return "active"; },
      async loadEnvironment() { return { season: "spring", weather: "clear" }; },
      async findByTimeEventId() { return undefined; },
      async claim() { return { id: "execution-1" }; },
      async applyWorldStatus() {},
      async complete() {},
      async fail() {},
    };
    const engine = await createSupabaseRuntimeEngine(adapter() as never, "map-1", eventAdapter);
    const result = await engine!.tick([{ id: "festival", startTick: 1, endTick: 3 }], 1);
    expect(engine!.bridge.snapshot().state.activeEventIds).toEqual(["festival"]);
    expect(calls).toContain("candidate:festival");
    expect(result.eventResults).toHaveLength(1);
    expect(result.eventResults[0].status).toBe("executed");
    expect(result.results).toHaveLength(2);
  });

  it("fails closed when the engine cannot load the map", async () => {
    const engine = await createSupabaseRuntimeEngine(adapter() as never, "missing");
    expect(engine).toBeUndefined();
  });
});
