import { describe, expect, it } from "vitest";
import { advanceGameClock } from "../domain/runtime-clock";

describe("runtime clock", () => {
  it("rolls the day and activates scheduled events by tick", () => {
    const result = advanceGameClock({
      worldId: "world-1",
      clock: { tick: 10, day: 3, hour: 23, minute: 59, season: "spring" },
      activeEventIds: [],
      stateVersion: "engine:1",
    }, 2, [{ id: "night-event", startTick: 11, endTick: 20 }]);
    expect(result.clock).toMatchObject({ tick: 11, day: 4, hour: 0, minute: 1 });
    expect(result.activeEventIds).toEqual(["night-event"]);
    expect(result.stateVersion).toBe("engine:1:runtime:11");
  });

  it("rejects fractional or negative time", () => {
    expect(() => advanceGameClock({ worldId: "w", clock: { tick: 0, day: 1, hour: 0, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "v" }, -1)).toThrow();
    expect(() => advanceGameClock({ worldId: "w", clock: { tick: 0, day: 1, hour: 0, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "v" }, 0.5)).toThrow();
  });
});
