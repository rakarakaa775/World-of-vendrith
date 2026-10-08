import { describe, expect, it } from "vitest";
import { createSupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";

function makeClient() {
  const rows: Record<string, unknown[]> = {
    world_environment_clocks: [],
    world_environment_states: [],
    season_definitions: [],
    world_weather_states: [],
    weather_definitions: [],
    simulation_clock: [{ world_id: "world-1", current_tick: 371, current_date: "2026-10-03T14:30:00.000Z", speed: 1, paused: false, updated_at: "2026-10-03T14:29:00.000Z" }],
    time_events: [{ id: "event-1", world_id: "world-1", scheduled_time: "2026-10-03T14:30:00.000Z", status: "scheduled" }],
    maps: [{
      id: "map-1", world_id: "world-1", name: "World Map", map_type: "world",
      width: 3, height: 2, metadata: { activeRegionId: "region-1" },
      updated_at: "2026-10-03T00:00:00.000Z",
    }],
    vandrith_map_navigation_grid: [
      { map_id: "map-1", x: 0, y: 0, walkable: true, collision: false },
      { map_id: "map-1", x: 1, y: 0, walkable: false, collision: true },
      { map_id: "map-1", x: 2, y: 0, walkable: true, collision: false },
      { map_id: "map-1", x: 0, y: 1, walkable: true, collision: false },
      { map_id: "map-1", x: 1, y: 1, walkable: true, collision: false },
      { map_id: "map-1", x: 2, y: 1, walkable: true, collision: false },
    ],
    npc_seed_catalog: [{
      seed_key: "NPC-1", name: "Aldren", race: "human",
      occupation_name: "guard", settlement_name: "Village",
      location_name: "Gate", active: true,
      metadata: { npcRuntimeContract: { version: 1, decisionProfile: { archetype: "military", role: "guard", capabilities: { behaviors: ["idle", "investigate"], goals: ["go-to-location"] }, personality: { traits: ["disciplined"] } }, environmentPolicy: { npc_movement: { cost_multiplier: 1.5 } } } },
    }],
    npc_seed_entries: [{ seed_key: "NPC-1", location_id: "loc-1" }],
    vandrith_unified_object_placement: [{
      map_id: "map-1", entity_type: "npc", entity_id: "entity-1",
      x: 2, y: 1, properties: { seed_key: "NPC-1" },
    }],
  };

  return {
    rpc(name: string) {
      if (name === "read_latest_world_runtime_checkpoint_v1") return Promise.resolve({ data: [], error: null });
      if (name === "read_world_runtime_mutations_v1") return Promise.resolve({ data: [], error: null });
      throw new Error(`unexpected rpc: ${name}`);
    },
    from(table: string) {
      let current = rows[table] ?? [];
      const builder = {
        select() { return builder; },
        eq(column: string, value: unknown) {
          current = current.filter(row => (row as Record<string, unknown>)[column] === value);
          return builder;
        },
        in(column: string, values: unknown[]) {
          current = current.filter(row => values.includes((row as Record<string, unknown>)[column]));
          return builder;
        },
        maybeSingle() { return Promise.resolve({ data: current[0] ?? null, error: null }); },
        order() { return builder; },
        then(resolve: (value: { data: unknown[]; error: null }) => unknown) {
          return Promise.resolve({ data: current, error: null }).then(resolve);
        },
      };
      return builder;
    },
  };
}

describe("supabase runtime world adapter", () => {
  it("loads authoritative map navigation and placed NPCs", async () => {
    const result = await createSupabaseRuntimeWorldAdapter(makeClient() as never).load("map-1");

    expect(result?.snapshot.state.worldId).toBe("world-1");
    expect(result?.snapshot.state.activeRegionId).toBe("region-1");
    expect(result?.snapshot.state.clock).toEqual({ tick: 371, day: 3, hour: 14, minute: 30, season: "unknown" });
    expect(result?.snapshot.state.activeEventIds).toEqual(["event-1"]);
    expect(result?.scheduledEvents).toEqual([{ id: "event-1", startTick: 371, endTick: 372 }]);
    expect(result?.snapshot.entities).toHaveLength(1);
    expect(result?.snapshot.entities[0]).toMatchObject({
      id: "entity-1",
      kind: "npc",
      mapId: "map-1",
      position: { x: 2, y: 1 },
      state: { decisionProfile: { archetype: "military", role: "guard", capabilities: { behaviors: ["idle", "investigate"], goals: ["go-to-location"] } }, environmentPolicy: { npc_movement: { cost_multiplier: 1.5 } } },
    });
    expect(result?.grid).toEqual({
      width: 3,
      height: 2,
      blocked: [false, true, false, false, false, false],
    });
  });

  it("fails closed when the map does not exist", async () => {
    const result = await createSupabaseRuntimeWorldAdapter(makeClient() as never).load("missing");
    expect(result).toBeUndefined();
  });
});
