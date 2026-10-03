import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { runNpcRuntimeTick } from "./npc-runtime-loop";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";
import { createSupabaseRuntimeWorldBridge } from "./supabase-runtime-world-bridge";

function makeAdapter() {
  const snapshot: RuntimeWorldSnapshot = {
    state: {
      worldId: "world-1",
      clock: { tick: 0, day: 1, hour: 8, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "engine:1",
    },
    entities: [
      { id: "npc-1", kind: "npc", mapId: "map-1", position: { x: 0, y: 0 }, state: { name: "Aldren", blocksMovement: true } },
      { id: "player-1", kind: "player", mapId: "map-1", position: { x: 2, y: 0 }, state: { blocksMovement: false } },
    ],
  };
  const grid: NavigationGrid = { width: 3, height: 1, blocked: [false, false, false] };
  return { async load(mapId: string) { return mapId === "map-1" ? { snapshot, grid, scheduledEvents: [] } : undefined; } };
}

function requestFrom(observation: RuntimeObservation): RuntimeAiRequest {
  return {
    id: "bridge-tick-1",
    surface: "game",
    intelligence: "npc",
    observation,
    goal: "follow the visible player",
  };
}

describe("supabase runtime world bridge", () => {
  it("bridges engine state through the NPC runtime tick loop", async () => {
    const bridge = await createSupabaseRuntimeWorldBridge(makeAdapter() as never, "map-1");
    expect(bridge).toBeDefined();
    const first = bridge!.snapshot();
    const request: RuntimeAiRequest = {
      id: "bridge-tick-1",
      surface: "game",
      intelligence: "npc",
      observation: {
        id: "seed-observation",
        surface: "game",
        intelligence: "npc",
        state: first.state,
        perception: { self: first.entities[0], nearbyEntities: [first.entities[1]], visibleMapIds: ["map-1"], environment: { season: "spring" } },
        facts: [],
      },
      goal: "follow the visible player",
    };

    bridge!.advanceClock();
    const result = await runNpcRuntimeTick(request, bridge!.ports, bridge!.store);
    const after = bridge!.snapshot();

    expect(result.status).toBe("moved");
    expect(result.execution?.ok).toBe(true);
    expect(result.verification?.ok).toBe(true);
    expect(after.entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 0, y: 0 });
    expect(after.state.clock.tick).toBe(1);
    expect(after.state.stateVersion).toBe("engine:1:runtime:1");
  });

  it("refreshes the runtime snapshot from the authoritative adapter", async () => {
    const base = makeAdapter();
    let loads = 0;
    const adapter = {
      async load(mapId: string) {
        loads += 1;
        const loaded = await base.load(mapId);
        if (!loaded) return undefined;
        return {
          ...loaded,
          snapshot: {
            ...loaded.snapshot,
            state: { ...loaded.snapshot.state, weather: loads > 1 ? "storm" : undefined },
          },
        };
      },
    };
    const bridge = await createSupabaseRuntimeWorldBridge(adapter as never, "map-1");
    expect(bridge!.snapshot().state.weather).toBeUndefined();
    expect(await bridge!.refreshAuthoritative()).toBe(true);
    expect(bridge!.snapshot().state.weather).toBe("storm");
    expect(loads).toBe(2);
  });

  it("fails closed when the engine adapter cannot load the map", async () => {
    const bridge = await createSupabaseRuntimeWorldBridge(makeAdapter() as never, "missing");
    expect(bridge).toBeUndefined();
  });
});
