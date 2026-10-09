import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { validateNavigationWaterCells, type NavigationGrid } from "../domain/runtime-navigation";
import { applyDynamicNavigationObstacles, createNavigationPlan, decideNpcNavigation, findNavigationPath } from "./npc-navigation";

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

  it("routes around a dynamic NPC obstacle and ignores the planning NPC itself", () => {
    const result = applyDynamicNavigationObstacles(
      grid,
      [
        { entityId: "npc-2", mapId: "region-1", position: { x: 2, y: 0 }, blocksMovement: true },
        { entityId: "npc-1", mapId: "region-1", position: { x: 0, y: 0 }, blocksMovement: true },
      ],
      "npc-1",
      "region-1",
    );
    const path = findNavigationPath(result, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path?.points).not.toContainEqual({ x: 2, y: 0 });
    expect(path?.points[0]).toEqual({ x: 0, y: 0 });
    expect(path?.points.at(-1)).toEqual({ x: 4, y: 0 });
  });

  it("fails closed when a dynamic obstacle occupies the target", () => {
    const result = applyDynamicNavigationObstacles(
      grid,
      [{ entityId: "player-1", mapId: "region-1", position: { x: 4, y: 4 }, blocksMovement: true }],
      "npc-1",
      "region-1",
    );
    expect(findNavigationPath(result, { x: 0, y: 0 }, { x: 4, y: 4 })).toBeUndefined();
  });

  it("does not import dynamic obstacles from another map", () => {
    const result = applyDynamicNavigationObstacles(
      grid,
      [{ entityId: "npc-2", mapId: "other-map", position: { x: 1, y: 0 }, blocksMovement: true }],
      "npc-1",
      "region-1",
    );
    expect(result.blocked[1]).toBe(false);
  });

  it("applies an explicit environment movement cost multiplier", () => {
    const envObservation = {
      ...observation,
      state: {
        ...observation.state,
        environmentConditions: { npc_movement: { cost_multiplier: 2.5 } },
      },
    };
    const plan = createNavigationPlan(envObservation, grid, { x: 4, y: 4 });
    expect(plan.found).toBe(true);
    expect(plan.cost).toBe(20);
    expect(plan.reason).toContain("explicit environment");
  });

  it("ignores weather when no movement rule is configured", () => {
    const envObservation = {
      ...observation,
      state: {
        ...observation.state,
        environmentConditions: { weather: "rain" },
      },
    };
    const plan = createNavigationPlan(envObservation, grid, { x: 4, y: 4 });
    expect(plan.found).toBe(true);
    expect(plan.cost).toBe(8);
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

  it("blocks water with missing authored semantics", () => {
    const waterGrid: NavigationGrid = {
      width: 3, height: 1, blocked: [false, false, false],
      waterCells: [{ x: 1, y: 0, surface: "water" }],
    };
    expect(findNavigationPath(waterGrid, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeUndefined();
  });

  it("allows explicitly designated shallow shoreline without granting swimming", () => {
    const waterGrid: NavigationGrid = {
      width: 3, height: 1, blocked: [false, false, false],
      waterCells: [{
        x: 1, y: 0, surface: "water", feature: "shoreline",
        depth: "shallow", shallowWalkable: true,
      }],
    };
    expect(findNavigationPath(waterGrid, { x: 0, y: 0 }, { x: 2, y: 0 })?.cost).toBe(2);
  });

  it("requires water transport for deep sea even when the actor can swim", () => {
    const waterGrid: NavigationGrid = {
      width: 3, height: 1, blocked: [false, false, false],
      waterCells: [{ x: 1, y: 0, surface: "water", feature: "ocean_sea", depth: "deep" }],
    };
    expect(findNavigationPath(waterGrid, { x: 0, y: 0 }, { x: 2, y: 0 }, { canSwim: true })).toBeUndefined();
    expect(findNavigationPath(waterGrid, { x: 0, y: 0 }, { x: 2, y: 0 }, { canSwim: true, hasWaterTransport: true })?.cost).toBe(2);
  });

  it("reads swimming and transport capabilities from the moving actor state", () => {
    const waterGrid: NavigationGrid = {
      width: 3, height: 1, blocked: [false, false, false],
      waterCells: [{ x: 1, y: 0, surface: "water", feature: "ocean_sea", depth: "deep" }],
    };
    const actorObservation = {
      ...observation,
      perception: {
        ...observation.perception!,
        self: { ...observation.perception!.self!, state: { canSwim: true } },
      },
    };
    expect(createNavigationPlan(actorObservation, waterGrid, { x: 2, y: 0 }).found).toBe(false);
    const transportActorObservation = {
      ...actorObservation,
      perception: {
        ...actorObservation.perception!,
        self: { ...actorObservation.perception!.self!, state: { canSwim: true, hasWaterTransport: true } },
      },
    };
    expect(createNavigationPlan(transportActorObservation, waterGrid, { x: 2, y: 0 }).found).toBe(true);
  });

  it("does not let water semantics bypass physical collision", () => {
    const waterGrid: NavigationGrid = {
      width: 3, height: 1, blocked: [false, true, false],
      waterCells: [{
        x: 1, y: 0, surface: "water", feature: "shoreline",
        depth: "shallow", shallowWalkable: true, crossingPoint: true,
      }],
    };
    expect(findNavigationPath(waterGrid, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeUndefined();
  });

  it("blocks river cells with strong or unknown current", () => {
    const base: NavigationGrid = {
      width: 3, height: 1, blocked: [false, false, false],
      waterCells: [{ x: 1, y: 0, surface: "water", feature: "river", depth: "medium", current: "strong" }],
    };
    expect(findNavigationPath(base, { x: 0, y: 0 }, { x: 2, y: 0 }, { canSwim: true })).toBeUndefined();
    expect(findNavigationPath({
      ...base, waterCells: [{ x: 1, y: 0, surface: "water", feature: "river", depth: "medium", current: "unknown" }],
    }, { x: 0, y: 0 }, { x: 2, y: 0 }, { canSwim: true })).toBeUndefined();
  });

});

describe("navigation water metadata validation", () => {
  it("accepts explicit, in-bounds water semantics without deriving them from terrain IDs", () => {
    const result = validateNavigationWaterCells(3, 1, [
      { x: 1, y: 0, surface: "water", feature: "shoreline", depth: "shallow", shallowWalkable: true },
    ]);
    expect(result).toEqual({
      valid: true,
      cells: [{ x: 1, y: 0, surface: "water", feature: "shoreline", depth: "shallow", shallowWalkable: true }],
    });
  });

  it("rejects duplicate and out-of-bounds coordinates rather than silently dropping records", () => {
    const result = validateNavigationWaterCells(2, 1, [
      { x: 1, y: 0, surface: "water", feature: "river" },
      { x: 1, y: 0, surface: "water", feature: "river" },
      { x: 2, y: 0, surface: "water", feature: "ocean_sea", depth: "deep" },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some(error => error.includes("Duplicate water cell coordinate 1:0"))).toBe(true);
      expect(result.errors.some(error => error.includes("outside map bounds"))).toBe(true);
    }
  });

  it("rejects invalid enum values and non-boolean crossing flags", () => {
    const result = validateNavigationWaterCells(2, 1, [
      { x: 0, y: 0, surface: "water", feature: "ocean", depth: "bottomless", bridge: "yes" },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some(error => error.includes("invalid feature"))).toBe(true);
      expect(result.errors.some(error => error.includes("invalid depth"))).toBe(true);
      expect(result.errors.some(error => error.includes("field bridge must be boolean"))).toBe(true);
    }
  });

  it("rejects non-array payloads and invalid map dimensions", () => {
    expect(validateNavigationWaterCells(0, 1, []).valid).toBe(false);
    expect(validateNavigationWaterCells(2, 1, { x: 0, y: 0 }).valid).toBe(false);
  });
});
