import { describe, expect, it } from "vitest";
import { createMap } from "../../editor/map-document";
import { serializeMapDocumentV2 } from "../../editor/map-snapshot-v2";
import { TERRAIN_SEMANTICS_SCHEMA, TERRAIN_SEMANTICS_VERSION } from "../../editor/terrain-semantics";
import { createSupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";

function makeClient(terrainSnapshot?: unknown, terrainEnvelopeOverride?: unknown, contractOverrides: unknown[] = []) {
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
      metadata: { npcRuntimeContract: { version: 1, decisionProfile: { archetype: "military", role: "guard", capabilities: { behaviors: ["idle", "investigate"], goals: ["go-to-location"] }, personality: { traits: ["disciplined"] } }, environmentPolicy: { npc_movement: { cost_multiplier: 1.5 } }, traversalCapabilities: { canSwim: true, hasWaterTransport: false } } },
    }],
    npc_seed_entries: [{ seed_key: "NPC-1", location_id: "loc-1" }],
    npc_creator_runtime_contract_overrides: contractOverrides,
    vandrith_unified_object_placement: [{
      map_id: "map-1", entity_type: "npc", entity_id: "entity-1",
      x: 2, y: 1, properties: { seed_key: "NPC-1" },
    }],
  };

  return {
    rpc(name: string) {
      if (name === "read_latest_world_runtime_checkpoint_v1") return Promise.resolve({ data: [], error: null });
      if (name === "read_world_runtime_mutations_v1") return Promise.resolve({ data: [], error: null });
      if (name === "map_editor_get_runtime_snapshot_v1") {
        return Promise.resolve({
          data: terrainEnvelopeOverride !== undefined
            ? terrainEnvelopeOverride
            : terrainSnapshot === undefined
              ? { ok: true, found: false }
              : { ok: true, found: true, snapshot: terrainSnapshot },
          error: null,
        });
      }
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
      state: { decisionProfile: { archetype: "military", role: "guard", capabilities: { behaviors: ["idle", "investigate"], goals: ["go-to-location"] } }, environmentPolicy: { npc_movement: { cost_multiplier: 1.5 } }, canSwim: true, hasWaterTransport: false },
    });
    expect(result?.grid).toEqual({
      width: 3,
      height: 2,
      blocked: [false, true, false, false, false, false],
    });
  });

  it("prefers the authenticated creator's persisted contract override over shared catalog metadata", async () => {
    const result = await createSupabaseRuntimeWorldAdapter(makeClient(undefined, undefined, [{
      seed_key: "NPC-1",
      runtime_contract: {
        version: 1,
        decisionProfile: { archetype: "civilian", role: "citizen", capabilities: { behaviors: ["idle"], goals: ["work"] } },
        environmentPolicy: { npc_movement: { cost_multiplier: 2 } },
        traversalCapabilities: { canSwim: false, hasWaterTransport: true },
      },
    }]) as never).load("map-1");

    expect(result?.snapshot.entities[0].state).toMatchObject({
      decisionProfile: { archetype: "civilian", role: "citizen" },
      environmentPolicy: { npc_movement: { cost_multiplier: 2 } },
      canSwim: false,
      hasWaterTransport: true,
    });
  });

  it("projects validated authored V2 water semantics into the runtime navigation grid", async () => {
    const document = { ...createMap("world", null, "exterior", null, 3, 2), id: "map-1" };
    const snapshot = JSON.parse(serializeMapDocumentV2({
      document,
      terrainSemantics: {
        schema: TERRAIN_SEMANTICS_SCHEMA,
        version: TERRAIN_SEMANTICS_VERSION,
        cells: [
          { x: 1, y: 0, surface: "water", feature: "ocean_sea", depth: "deep" },
          { x: 0, y: 1, surface: "water", feature: "river", depth: "medium", current: "calm" },
        ],
      },
    }));

    const result = await createSupabaseRuntimeWorldAdapter(makeClient(snapshot) as never).load("map-1");
    expect(result?.grid.waterCells).toEqual([
      { x: 1, y: 0, surface: "water", feature: "ocean_sea", depth: "deep" },
      { x: 0, y: 1, surface: "water", feature: "river", depth: "medium", current: "calm" },
    ]);
  });

  it("fails closed when a persisted V2 terrain snapshot is invalid", async () => {
    const document = { ...createMap("world", null, "exterior", null, 3, 2), id: "map-1" };
    const snapshot = JSON.parse(serializeMapDocumentV2({
      document,
      terrainSemantics: {
        schema: TERRAIN_SEMANTICS_SCHEMA,
        version: TERRAIN_SEMANTICS_VERSION,
        cells: [],
      },
    }));
    snapshot.terrainSemantics.cells = [
      { x: 1, y: 0, surface: "water" },
      { x: 1, y: 0, surface: "land" },
    ];

    const result = await createSupabaseRuntimeWorldAdapter(makeClient(snapshot) as never).load("map-1");
    expect(result).toBeUndefined();
  });

  it("fails closed when the terrain snapshot RPC returns a malformed envelope", async () => {
    for (const envelope of [
      null,
      { ok: false, found: false },
      { ok: true, found: "false" },
      { ok: true, found: true },
      { ok: true, found: false, snapshot: { unexpected: true } },
    ]) {
      const result = await createSupabaseRuntimeWorldAdapter(makeClient(undefined, envelope) as never).load("map-1");
      expect(result).toBeUndefined();
    }
  });

  it("fails closed when the map does not exist", async () => {
    const result = await createSupabaseRuntimeWorldAdapter(makeClient() as never).load("missing");
    expect(result).toBeUndefined();
  });
});
