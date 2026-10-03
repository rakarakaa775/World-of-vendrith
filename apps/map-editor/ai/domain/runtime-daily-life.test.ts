import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "./runtime";
import { createNpcDailyLifeStateStore, resolveNpcDailyLifeState } from "./runtime-daily-life";

function observation(x: number, y: number, tick: number): RuntimeObservation {
  return {
    id: "obs-" + tick,
    surface: "game",
    intelligence: "npc",
    goal: "daily life",
    state: { worldId: "world-1", clock: { tick, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "state-" + tick },
    perception: { self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x, y } }, nearbyEntities: [], detections: [] },
    facts: [],
  } as RuntimeObservation;
}

describe("npc daily life state", () => {
  it("persists traveling state until the scheduled target is reached", () => {
    const store = createNpcDailyLifeStateStore();
    const goal = { kind: "work" as const, targetLocation: { mapId: "region-1", x: 3, y: 0 } };
    const first = resolveNpcDailyLifeState(observation(0, 0, 1), goal);
    expect(first).toMatchObject({ goal: "work", phase: "traveling", transition: "started", startedAtTick: 1 });
    store.set(first!);
    const second = resolveNpcDailyLifeState(observation(1, 0, 2), goal, store.get("npc-1"));
    expect(second).toMatchObject({ goal: "work", phase: "traveling", transition: "continuing", startedAtTick: 1, updatedAtTick: 2 });
    store.set(second!);
    const third = resolveNpcDailyLifeState(observation(3, 0, 3), goal, store.get("npc-1"));
    expect(third).toMatchObject({ goal: "work", phase: "active", transition: "arrived", startedAtTick: 1, updatedAtTick: 3 });
  });

  it("preserves the activity start tick while actively performing the same goal", () => {
    const previous = resolveNpcDailyLifeState(observation(3, 0, 3), { kind: "work", targetLocation: { mapId: "region-1", x: 3, y: 0 } });
    const next = resolveNpcDailyLifeState(observation(3, 0, 4), { kind: "work", targetLocation: { mapId: "region-1", x: 3, y: 0 } }, previous);
    expect(next).toMatchObject({ goal: "work", phase: "active", transition: "continuing", startedAtTick: 3, updatedAtTick: 4 });
  });
  it("resets to a new activity start when the goal changes", () => {
    const previous = resolveNpcDailyLifeState(observation(3, 0, 3), { kind: "work", targetLocation: { mapId: "region-1", x: 3, y: 0 } });
    const next = resolveNpcDailyLifeState(observation(3, 0, 4), { kind: "sleep" }, previous);
    expect(next).toMatchObject({ goal: "sleep", phase: "active", transition: "goal-changed", startedAtTick: 4, updatedAtTick: 4 });
  });
});
