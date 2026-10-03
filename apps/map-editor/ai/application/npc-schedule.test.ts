import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import type { NpcSchedule } from "../domain/runtime-schedule";
import { chooseScheduledLocation, decideNpcSchedule, calculateNpcSchedulePressure } from "./npc-schedule";

const observation: RuntimeObservation = {
  id: "obs-schedule", surface: "game", intelligence: "npc",
  state: {
    worldId: "world-1",
    clock: { tick: 30, day: 1, hour: 9, minute: 0, season: "spring" },
    activeEventIds: [], stateVersion: "state-30",
  },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 1, y: 1 } },
    nearbyEntities: [], visibleMapIds: ["region-1"], environment: { activeRegionId: "region-1" },
  },
  facts: [],
};
const request: RuntimeAiRequest = {
  id: "runtime-schedule", surface: "game", intelligence: "npc",
  observation, goal: "Follow schedule.",
};
const schedule: NpcSchedule = {
  npcId: "npc-1",
  entries: [
    { goal: "work", startHour: 8, endHour: 12, priority: 40, location: { mapId: "town", x: 10, y: 4 }, locationRole: "workplace", dailyLifeActivity: "work" },
    { goal: "eat", startHour: 12, endHour: 13, priority: 50, location: { mapId: "town", x: 4, y: 8 }, locationRole: "home", dailyLifeActivity: "routine" },
    { goal: "sleep", startHour: 22, endHour: 6, priority: 60, location: { mapId: "home", x: 2, y: 2 }, locationRole: "home", dailyLifeActivity: "rest" },
  ],
};

describe("NPC schedule", () => {
  it("selects the location active for the current hour", () => {
    expect(chooseScheduledLocation(observation, schedule, "work")?.location).toEqual({ mapId: "town", x: 10, y: 4 });
  });

  it("supports overnight schedule windows", () => {
    const night = { ...observation, state: { ...observation.state, clock: { ...observation.state.clock, hour: 23 } } };
    expect(chooseScheduledLocation(night, schedule, "sleep")?.location.mapId).toBe("home");
  });

  it("returns no decision when the goal has no scheduled location", () => {
    expect(decideNpcSchedule(request, observation, schedule, "eat")).toBeUndefined();
  });

  it("creates a state-bound movement decision", () => {
    const decision = decideNpcSchedule(request, observation, schedule, "work");
    expect(decision?.actions[0].type).toBe("npc.go-to-location");
    expect(decision?.actions[0].payload.targetLocation).toEqual({ mapId: "town", x: 10, y: 4 });
    expect(decision?.actions[0].payload.locationRole).toBe("workplace");
    expect(decision?.actions[0].payload.dailyLifeActivity).toBe("work");
    expect(decision?.stateVersion).toBe("state-30");
    expect(decision?.expiresAtTick).toBe(31);
  });
});

it("adds bounded pressure as a schedule window progresses and the NPC is far from its target", () => {
  const late = { ...observation, state: { ...observation.state, clock: { ...observation.state.clock, hour: 11 } }, perception: { ...observation.perception, self: { ...observation.perception.self, position: { x: 0, y: 0 } } } };
  expect(calculateNpcSchedulePressure(late, schedule.entries[0])).toBe(25);
});
