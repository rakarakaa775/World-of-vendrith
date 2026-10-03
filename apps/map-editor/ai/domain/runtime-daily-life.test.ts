import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "./runtime";
import { createNpcDailyLifeGoalFromSchedule, createNpcDailyLifeStateStore, resolveNpcDailyLifeState, syncNpcDailyLifeWithBehavior } from "./runtime-daily-life";

function observation(x: number, y: number, tick: number, day = 1): RuntimeObservation {
  return {
    id: "obs-" + tick,
    surface: "game",
    intelligence: "npc",
    goal: "daily life",
    state: { worldId: "world-1", clock: { tick, day, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "state-" + tick },
    perception: { self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x, y } }, nearbyEntities: [], detections: [] },
    facts: [],
  } as RuntimeObservation;
}

describe("npc daily life state", () => {
  it("converts a schedule entry into a daily-life goal without losing location semantics", () => {
    const goal = createNpcDailyLifeGoalFromSchedule({ goal: "go-to-location", location: { mapId: "recreation", x: 8, y: 4 }, locationRole: "recreation", dailyLifeActivity: "recreation" });
    expect(goal).toEqual({ kind: "go-to-location", targetLocation: { mapId: "recreation", x: 8, y: 4 }, locationRole: "recreation", activity: "recreation" });
  });
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

  it("tracks workplace, home, free-time, recreation, and social roles", () => {
    const roles = [
      ["workplace", "work"],
      ["home", "routine"],
      ["free-time", "free-time"],
      ["recreation", "recreation"],
      ["social", "social"],
    ] as const;
    for (const [locationRole, activity] of roles) {
      const state = resolveNpcDailyLifeState(observation(0, 0, 5), {
        kind: "go-to-location",
        locationRole,
        activity,
      });
      expect(state).toMatchObject({ locationRole, activity, phase: "active" });
    }
  });

  it("represents travel as a persistent phase before arrival", () => {
    const state = resolveNpcDailyLifeState(observation(0, 0, 6), {
      kind: "go-to-location",
      targetLocation: { mapId: "region-1", x: 4, y: 4 },
      locationRole: "recreation",
      activity: "recreation",
    });
    expect(state).toMatchObject({
      phase: "traveling",
      locationRole: "recreation",
      activity: "recreation",
    });
  });

  it("records the previous daily-life activity when the schedule changes", () => {
    const work = resolveNpcDailyLifeState(observation(3, 0, 10), {
      kind: "work",
      locationRole: "workplace",
      activity: "work",
    });
    const home = resolveNpcDailyLifeState(observation(3, 0, 11), {
      kind: "sleep",
      locationRole: "home",
      activity: "rest",
    }, work);

    expect(home).toMatchObject({
      transition: "goal-changed",
      previousActivity: "work",
      previousLocationRole: "workplace",
      transitionCount: 2,
      startedAtTick: 11,
    });
  });

  it("keeps the transition count stable while continuing the same activity", () => {
    const first = resolveNpcDailyLifeState(observation(0, 0, 20), {
      kind: "go-to-location",
      locationRole: "recreation",
      activity: "recreation",
    });
    const second = resolveNpcDailyLifeState(observation(0, 0, 21), {
      kind: "go-to-location",
      locationRole: "recreation",
      activity: "recreation",
    }, first);

    expect(second).toMatchObject({
      transition: "continuing",
      transitionCount: 1,
      startedAtTick: 20,
    });
  });

  it("keeps daily-life state synchronized with the active runtime behavior", () => {
    const state = resolveNpcDailyLifeState(observation(0, 0, 30), {
      kind: "work",
      locationRole: "workplace",
      activity: "work",
    });
    const synced = syncNpcDailyLifeWithBehavior(state, "work", "completed", 31);

    expect(synced).toMatchObject({
      goal: "work",
      activity: "work",
      behavior: "work",
      behaviorStatus: "completed",
      updatedAtTick: 31,
    });
  });

  it("carries an ongoing activity across a day boundary without resetting its start", () => {
    const first = resolveNpcDailyLifeState(observation(0, 0, 100, 1), {
      kind: "sleep",
      locationRole: "home",
      activity: "rest",
    });
    const nextDay = resolveNpcDailyLifeState(observation(0, 0, 101, 2), {
      kind: "sleep",
      locationRole: "home",
      activity: "rest",
    }, first);

    expect(nextDay).toMatchObject({
      transition: "continuing",
      day: 2,
      dayTransitionCount: 1,
      startedAtTick: 100,
    });
  });

  it("does not create daily-life state when no daily-life state exists", () => {
    expect(syncNpcDailyLifeWithBehavior(undefined, "sleep", "running", 40)).toBeUndefined();
  });
});
