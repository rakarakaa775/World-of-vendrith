import { describe, expect, it } from "vitest";
import { createNpcWorldAwareness, applyNpcWorldAwarenessToGoal, rankWorldLocations } from "./npc-world-awareness";
import type { RuntimeObservation } from "../domain/runtime";

function observation(overrides: Partial<RuntimeObservation> = {}): RuntimeObservation {
  return {
    id: "obs-1",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick: 1, day: 1, hour: 21, minute: 0, season: "winter" },
      weather: "storm",
      environmentConditions: {
        hazards: ["danger-zone"],
        available_resources: ["food", "water"],
        travel_restricted: true,
      },
      activeRegionId: "region-1",
      activeEventIds: ["event-1"],
      stateVersion: "v1",
    },
    perception: {
      self: { id: "npc-1", kind: "npc", mapId: "map-1", position: { x: 2, y: 2 } },
      nearbyEntities: [
        { id: "npc-2", kind: "npc", mapId: "map-1", position: { x: 3, y: 2 } },
      ],
      detections: [],
      visibleMapIds: ["map-1"],
      environment: {
        weather: "storm",
        season: "winter",
        activeRegionId: "region-1",
        conditions: {
          hazards: ["danger-zone"],
          available_resources: ["food", "water"],
          travel_restricted: true,
        },
      },
    },
    facts: [],
    ...overrides,
  };
}

describe("NPC world awareness", () => {
  it("74 reads weather, season, region and time of day", () => {
    const awareness = createNpcWorldAwareness(observation());
    expect(awareness).toMatchObject({
      mapId: "map-1",
      regionId: "region-1",
      weather: "storm",
      season: "winter",
      timeOfDay: "evening",
    });
  });

  it("75 detects world hazards from explicit conditions and weather", () => {
    const awareness = createNpcWorldAwareness(observation());
    expect(awareness.hazards).toEqual(["danger-zone", "storm"]);
    expect(awareness.travelRisk).toBe(100);
  });

  it("76 exposes available world resources deterministically", () => {
    expect(createNpcWorldAwareness(observation()).resources).toEqual(["food", "water"]);
  });

  it("77 tracks active world events as awareness inputs", () => {
    expect(createNpcWorldAwareness(observation()).worldEventIds).toEqual(["event-1"]);
  });

  it("78 changes goal priority according to world context", () => {
    const awareness = createNpcWorldAwareness(observation());
    expect(applyNpcWorldAwarenessToGoal({ awareness, goal: "respond-to-event", priority: 60 })).toBe(100);
    expect(applyNpcWorldAwarenessToGoal({ awareness, goal: "go-to-location", priority: 50 })).toBe(30);
  });

  it("79 ranks locations by deterministic world distance", () => {
    const locations = [
      { id: "z", kind: "object" as const, mapId: "map-1", position: { x: 5, y: 2 } },
      { id: "a", kind: "object" as const, mapId: "map-1", position: { x: 3, y: 2 } },
    ];
    expect(rankWorldLocations(observation(), locations).map(location => location.entityId)).toEqual(["a", "z"]);
  });

  it("80 isolates locations on other maps", () => {
    const locations = [
      { id: "same", kind: "object" as const, mapId: "map-1", position: { x: 3, y: 2 } },
      { id: "other", kind: "object" as const, mapId: "map-2", position: { x: 1, y: 1 } },
    ];
    expect(rankWorldLocations(observation(), locations).map(location => location.entityId)).toEqual(["same"]);
  });

  it("80b keeps explicitly tagged locations inside the active region", () => {
    const locations = [
      { id: "active", kind: "object" as const, mapId: "map-1", position: { x: 4, y: 2 }, state: { regionId: "region-1" } },
      { id: "other-region", kind: "object" as const, mapId: "map-1", position: { x: 3, y: 2 }, state: { regionId: "region-2" } },
    ];
    expect(rankWorldLocations(observation(), locations).map(location => location.entityId)).toEqual(["active"]);
  });

  it("81 handles calm daytime context without synthetic hazards", () => {
    const calm = observation({
      state: {
        ...observation().state,
        clock: { ...observation().state.clock, hour: 14 },
        weather: "clear",
        environmentConditions: { available_resources: ["work"] },
        activeEventIds: [],
      },
      perception: {
        ...observation().perception!,
        environment: { weather: "clear", season: "summer", activeRegionId: "region-1", conditions: { available_resources: ["work"] } },
      },
    });
    const awareness = createNpcWorldAwareness(calm);
    expect(awareness.hazards).toEqual([]);
    expect(awareness.timeOfDay).toBe("day");
    expect(awareness.travelRisk).toBe(0);
  });

  it("82 keeps awareness deterministic for the same observation", () => {
    const first = createNpcWorldAwareness(observation());
    const second = createNpcWorldAwareness(observation());
    expect(second).toEqual(first);
  });
});


it("recognizes the canonical WORLD resource metadata contract", async () => {
  const { hasNpcWorldResource } = await import("./npc-world-awareness");
  const entity = { id: "shelter-1", kind: "object" as const, mapId: "map-1", position: { x: 1, y: 1 }, state: { worldResource: "shelter" } };
  expect(hasNpcWorldResource(entity, "shelter")).toBe(true);
  expect(hasNpcWorldResource(entity, "medical")).toBe(false);
});
