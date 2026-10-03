import { describe, expect, it } from "vitest";
import { createSupabaseRuntimeEventAdapter } from "./supabase-runtime-event-adapter";

function clientMock() {
  const rows = {
    time_events: [{
      id: "event-1",
      world_id: "world-1",
      event_type: "world_pause",
      scheduled_time: "2026-10-03T12:02:00Z",
      status: "scheduled",
      payload: { reason: "test" },
    }],
    event_definitions: [{
      event_type: "world_pause",
      condition_type: "world_status",
      consequence_type: "world_status",
      condition_config: { expected_status: "active" },
      consequence_config: { target_status: "paused" },
      enabled: true,
    }],
    worlds: [{ id: "world-1", status: "active" }],
    event_executions: [],
    world_environment_states: [],
    world_environment_clocks: [],
    season_definitions: [],
    weather_definitions: [],
    world_weather_states: [],
  };
  return {
    rpc() { return Promise.resolve({ data: { conditions: {} }, error: null }); },
    from(table: keyof typeof rows) {
      const source = rows[table];
      const state = { filters: [] as [string, string, unknown][], statusIn: [] as string[] };
      const api = {
        select() { return api; },
        eq(column: string, value: unknown) { state.filters.push(["eq", column, value]); return api; },
        in(column: string, values: string[]) { if (column === "status") state.statusIn = values; return api; },
        order() { return api; },
        limit() { return api; },
        maybeSingle() {
          const data = source.find((row: any) => state.filters.every(([, column, value]) => row[column] === value)) ?? null;
          return Promise.resolve({ data, error: null });
        },
        insert() { return api; },
        update() { return api; },
        single() { return Promise.resolve({ data: { id: "execution-1" }, error: null }); },
        then(resolve: (value: { data: unknown; error: null }) => unknown) {
          return Promise.resolve(resolve({ data: source, error: null }));
        },
      };
      return api;
    },
  } as any;
}

describe("supabase runtime event adapter", () => {
  it("loads a scheduled event and its authoritative definition", async () => {
    const adapter = createSupabaseRuntimeEventAdapter(clientMock());
    const candidates = await adapter.loadCandidates("world-1", new Date("2026-10-03T12:00:00Z"), 10, 1);
    expect(candidates).toHaveLength(1);
    expect(candidates?.[0].eventType).toBe("world_pause");
    const definition = await adapter.loadDefinition("world_pause");
    expect(definition?.consequenceConfig.target_status).toBe("paused");
    expect(await adapter.loadWorldStatus("world-1")).toBe("active");
  });
});
