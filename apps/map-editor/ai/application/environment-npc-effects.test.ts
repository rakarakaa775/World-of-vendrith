import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { applyEnvironmentNpcBehavior, applyEnvironmentNpcGoalPriority, applyEnvironmentNpcNeeds } from "./environment-npc-effects";

const observation = (conditions: Record<string, unknown>): RuntimeObservation => ({
  id: "environment-npc",
  surface: "game",
  intelligence: "npc",
  state: {
    worldId: "world-1",
    clock: { tick: 10, day: 1, hour: 12, minute: 0, season: "spring" },
    activeEventIds: [],
    stateVersion: "state-10",
    environmentConditions: conditions,
  },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 } },
    nearbyEntities: [],
    visibleMapIds: ["region-1"],
    environment: { activeRegionId: "region-1", conditions },
  },
  facts: [],
});

describe("environment -> NPC effects", () => {
  it("applies only explicit npc_needs deltas", () => {
    const result = applyEnvironmentNpcNeeds(
      observation({ weather: "rain", npc_needs: { hunger: 12, energy: -7 } }),
      { hunger: 40, energy: 60, social: 20, safety: 80 },
    );
    expect(result).toEqual({ hunger: 52, energy: 53, social: 20, safety: 80 });
  });

  it("clamps explicit need effects to the 0-100 range", () => {
    const result = applyEnvironmentNpcNeeds(
      observation({ npc_needs: { hunger: 1000, energy: -1000 } }),
      { hunger: 90, energy: 10, social: 20, safety: 80 },
    );
    expect(result.hunger).toBe(100);
    expect(result.energy).toBe(0);
  });

  it("ignores unknown or malformed need conditions", () => {
    const result = applyEnvironmentNpcNeeds(
      observation({ rain: true, npc_needs: { hunger: "high", unknown: 50 } }),
      { hunger: 40, energy: 60, social: 20, safety: 80 },
    );
    expect(result).toEqual({ hunger: 40, energy: 60, social: 20, safety: 80 });
  });

  it("modifies behavior priority only when explicitly configured", () => {
    const candidates = [{
      kind: "flee" as const,
      priority: 10,
      reason: "base",
      action: { id: "a", intelligence: "npc" as const, type: "npc.flee", payload: {}, risk: "safe" as const, reason: "base" },
    }];
    const result = applyEnvironmentNpcBehavior(
      observation({ npc_behavior: { flee: { priority_delta: 25, reason: "Explicit environment rule." } } }),
      candidates,
    );
    expect(result[0]).toMatchObject({ priority: 35, reason: "Explicit environment rule." });
  });

  it("modifies goal priority only through the explicit registry key", () => {
    const result = applyEnvironmentNpcGoalPriority(
      observation({ npc_goal_priority: { eat: 15 } }),
      [{ kind: "eat", priority: 80, reason: "Hungry." }],
    );
    expect(result[0].priority).toBe(95);
  });
});
