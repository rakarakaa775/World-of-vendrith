import { describe, expect, it } from "vitest";
import { createRuntimeObservationPort } from "./runtime-observation";

describe("runtime observation", () => {
  it("builds a versioned perception snapshot from an authoritative source", async () => {
    const port = createRuntimeObservationPort({
      snapshot: async () => ({
        state: {
          worldId: "world-1",
          clock: { tick: 42, day: 2, hour: 9, minute: 30, season: "spring" },
          activeEventIds: ["event-1"],
          stateVersion: "state-42",
        },
        perception: {
          self: {
            id: "npc-1",
            kind: "npc",
            mapId: "region-1",
            position: { x: 10, y: 12 },
          },
          nearbyEntities: [
            {
              id: "player-1",
              kind: "player",
              mapId: "region-1",
              position: { x: 13, y: 12 },
            },
          ],
          visibleMapIds: ["region-1"],
          environment: { weather: "rain", season: "spring", activeRegionId: "region-1" },
        },
        facts: [{
          id: "fact-1",
          kind: "verified-fact",
          source: "engine",
          fact: "Rain is active.",
          confidence: "high",
        }],
      }),
    });

    const observation = await port.observe({
      id: "runtime-1",
      surface: "game",
      intelligence: "npc",
      goal: "Observe nearby activity.",
      observation: {} as never,
    });

    expect(observation.id).toBe("runtime-1:observation:state-42");
    expect(observation.state.stateVersion).toBe("state-42");
    expect(observation.perception?.nearbyEntities[0].kind).toBe("player");
    expect(observation.facts[0].source).toBe("engine");
  });
});
