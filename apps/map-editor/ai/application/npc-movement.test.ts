import { describe, expect, it } from "vitest";
import type { RuntimeAction } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeMovementState } from "../domain/runtime-movement";
import { executeNpcMovementStep } from "./npc-movement";

const grid: NavigationGrid = { width: 3, height: 3, blocked: [false,false,false,false,true,false,false,false,false] };
const state: RuntimeMovementState = { entityId: "npc-1", mapId: "region-1", position: { x: 0, y: 0 }, stateVersion: "v1" };
const action: RuntimeAction = {
  id: "navigate-1", intelligence: "npc", type: "npc.navigate", risk: "safe", reason: "test",
  payload: { path: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], targetLocation: { mapId: "region-1", x: 2, y: 0 } },
};

describe("NPC movement controller", () => {
  it("moves exactly one waypoint per tick", () => {
    const result = executeNpcMovementStep(action, state, grid, "v1");
    expect(result.reason).toBe("moved");
    expect(result.state.position).toEqual({ x: 1, y: 0 });
  });

  it("reports arrival at the final waypoint", () => {
    const result = executeNpcMovementStep(action, { ...state, position: { x: 1, y: 0 } }, grid, "v1");
    expect(result.reason).toBe("arrived");
    expect(result.state.position).toEqual({ x: 2, y: 0 });
  });

  it("blocks movement into a collision cell", () => {
    const blockedAction = { ...action, payload: { ...action.payload, path: [{ x: 0, y: 0 }, { x: 1, y: 1 }] } };
    const result = executeNpcMovementStep(blockedAction, state, grid, "v1");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("blocked");
    expect(result.state.position).toEqual(state.position);
  });

  it("rejects stale state", () => {
    const result = executeNpcMovementStep(action, state, grid, "v2");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("stale-state");
  });

  it("rejects a path that does not contain the current position", () => {
    const result = executeNpcMovementStep(action, { ...state, position: { x: 2, y: 2 } }, grid, "v1");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid-action");
  });
});
