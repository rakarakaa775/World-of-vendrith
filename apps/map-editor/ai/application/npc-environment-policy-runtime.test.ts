import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { effectiveNpcEnvironmentConditions } from "./npc-environment-policy-runtime";

const observation = (policy: Record<string, unknown>): RuntimeObservation => ({
  id: "obs-1", surface: "engine", intelligence: "npc",
  state: { worldId: "w", clock: { tick: 1, day: 1, hour: 1, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "1", environmentConditions: { npc_movement: { cost_multiplier: 2 } } },
  perception: { self: { id: "npc-1", kind: "npc", mapId: "m", position: { x: 0, y: 0 }, state: { environmentPolicy: policy } }, nearbyEntities: [], detections: [], visibleMapIds: ["m"], environment: {} }, facts: [],
});

describe("NPC environment policy runtime", () => {
  it("overrides only explicit NPC policy keys", () => {
    expect(effectiveNpcEnvironmentConditions(observation({ npc_movement: { cost_multiplier: 3 }, npc_sensing: { hearing_radius: 2 } }))).toEqual({ npc_movement: { cost_multiplier: 3 }, npc_sensing: { hearing_radius: 2 } });
  });
  it("ignores malformed NPC policy and preserves world conditions", () => {
    expect(effectiveNpcEnvironmentConditions(observation({ npc_movement: { cost_multiplier: "fast" } }))).toEqual({ npc_movement: { cost_multiplier: 2 } });
  });
});
