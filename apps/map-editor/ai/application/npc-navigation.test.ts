import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import { createNavigationPlan, decideNpcNavigation, findNavigationPath } from "./npc-navigation";

const grid: NavigationGrid = {
  width: 5, height: 5,
  blocked: [
    false,false,false,false,false,
    false,true,true,true,false,
    false,false,false,true,false,
    false,true,false,false,false,
    false,false,false,false,false,
  ],
};

const observation: RuntimeObservation = {
  id: "obs-navigation", surface: "game", intelligence: "npc",
  state: { worldId: "world-1", clock: { tick: 40, day: 1, hour: 10, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "state-40" },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 } },
    nearbyEntities: [], visibleMapIds: ["region-1"], environment: { activeRegionId: "region-1" },
  },
  facts: [],
};
const request: RuntimeAiRequest = { id: "runtime-navigation", surface: "game", intelligence: "npc", observation, goal: "Navigate to target." };

describe("NPC navigation", () => {
  it("finds a deterministic path around collision cells", () => {
    const result = findNavigationPath(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(result?.points[0]).toEqual({ x: 0, y: 0 });
    expect(result?.points.at(-1)).toEqual({ x: 4, y: 4 });
    expect(result?.cost).toBe(8);
  });

  it("fails closed when the target is blocked", () => {
    expect(findNavigationPath(grid, { x: 0, y: 0 }, { x: 1, y: 1 })).toBeUndefined();
  });

  it("creates a navigation plan from the NPC perception", () => {
    const plan = createNavigationPlan(observation, grid, { x: 4, y: 4 });
    expect(plan.found).toBe(true);
    expect(plan.path.length).toBeGreaterThan(1);
  });

  it("creates a state-bound navigation decision", () => {
    const decision = decideNpcNavigation(request, observation, grid, { x: 4, y: 4 });
    expect(decision?.actions[0].type).toBe("npc.navigate");
    expect(decision?.stateVersion).toBe("state-40");
    expect(decision?.expiresAtTick).toBe(41);
  });
});
