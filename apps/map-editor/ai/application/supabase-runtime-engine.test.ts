import { describe, expect, it } from "vitest";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";
import { createSupabaseRuntimeEngine } from "./supabase-runtime-engine";

function adapter(includePlayer = true) {
  const snapshot: RuntimeWorldSnapshot = {
    state: { worldId: "world-1", clock: { tick: 0, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "engine:1" },
    entities: [
      { id: "npc-1", kind: "npc", mapId: "map-1", position: { x: 0, y: 0 }, state: { name: "Aldren", blocksMovement: true, decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["idle", "follow-player", "investigate"] }, relationships: [{ targetNpcId: "npc-2", type: "friend", affinity: 20, trust: 30 }], relationshipPolicy: { rules: [{ type: "friend", minAffinity: 40, behaviors: { investigate: 20 } }] } } } },
      { id: "npc-2", kind: "npc", mapId: "map-1", position: { x: 0, y: 2 }, state: { name: "Elira", blocksMovement: true } },
      ...(includePlayer ? [{ id: "player-1", kind: "player" as const, mapId: "map-1", position: { x: 2, y: 0 }, state: { blocksMovement: false } }] : []),
    ],
  };
  const grid: NavigationGrid = { width: 3, height: 3, blocked: Array(9).fill(false) };
  return { async load(mapId: string) { return mapId === "map-1" ? { snapshot, grid, scheduledEvents: [] } : undefined; } };
}

describe("supabase runtime engine", () => {
  it("loads the authoritative world snapshot only once when creating the engine", async () => {
    let loadCount = 0;
    const base = adapter();
    const countedAdapter = {
      async load(mapId: string) {
        loadCount += 1;
        return base.load(mapId);
      },
    };
    const engine = await createSupabaseRuntimeEngine(countedAdapter as never, "map-1");
    expect(engine).toBeDefined();
    expect(loadCount).toBe(1);
  });

  it("runs all NPCs through the engine bridge and preserves runtime state versions", async () => {
    const engine = await createSupabaseRuntimeEngine(adapter() as never, "map-1");
    expect(engine).toBeDefined();
    const result = await engine!.tick([{ id: "festival", startTick: 1, endTick: 3 }], 1);
    expect(result.results).toHaveLength(2);
    expect(result.results.every(item => item.status === "moved")).toBe(true);
    expect(engine!.bridge.snapshot().entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 0, y: 0 });
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

  it("reuses relationship state across ticks after an explicit social interaction", async () => {
    const engine = await createSupabaseRuntimeEngine(adapter(false) as never, "map-1");
    expect(engine).toBeDefined();

    const applied = engine!.applySocialInteraction({
      interactionId: "interaction-1",
      sourceNpcId: "npc-1",
      targetNpcId: "npc-2",
      type: "help",
      affinityDelta: 25,
      trustDelta: 15,
      tick: 1,
    });
    expect(applied?.relationships[0]).toMatchObject({ affinity: 45, trust: 45 });

    engine!.memory.set({
      npcId: "npc-1",
      stateVersion: "engine:1",
      lastBehavior: "investigate",
      targetEntityId: "npc-2",
      lastKnownTargetPosition: { x: 0, y: 2 },
      lastSeenTick: 0,
      updatedAtTick: 0,
    });

    const result = await engine!.tick([], 1);
    const npcResult = result.results.find(item => item.observation.perception?.self?.id === "npc-1");
    expect(npcResult?.observation.perception?.self?.state.decisionProfile.relationships?.[0]).toMatchObject({
      targetNpcId: "npc-2",
      affinity: 45,
      trust: 45,
    });
    expect(npcResult?.behavior).toMatchObject({
      kind: "investigate",
      priority: 30,
      action: { type: "npc.investigate" },
    });
    expect(npcResult?.socialDiagnostics).toMatchObject({
      relationshipPolicyValidation: { ok: true },
      relationships: [{ targetNpcId: "npc-2", type: "friend", affinity: 45, trust: 45 }],
      selectedBehavior: { kind: "investigate", targetNpcId: "npc-2", priority: 30 },
    });
  });

  it("fails closed when the engine cannot load the map", async () => {
    const engine = await createSupabaseRuntimeEngine(adapter() as never, "missing");
    expect(engine).toBeUndefined();
  });
});
