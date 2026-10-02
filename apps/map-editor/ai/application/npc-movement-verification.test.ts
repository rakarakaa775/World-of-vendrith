import { describe, expect, it } from "vitest";
import type { RuntimeAction } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeMovementResult, RuntimeMovementState } from "../domain/runtime-movement";
import { replanNpcNavigation, verifyNpcMovement } from "./npc-movement-verification";

const grid: NavigationGrid = { width: 4, height: 3, blocked: [false,false,false,false,false,false,true,false,false,false,false,false] };
const state: RuntimeMovementState = { entityId: "npc-1", mapId: "region-1", position: { x: 0, y: 0 }, stateVersion: "v2" };
const action: RuntimeAction = {
  id: "navigate-1", intelligence: "npc", type: "npc.navigate", risk: "safe", reason: "test",
  payload: { path: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], targetLocation: { mapId: "region-1", x: 2, y: 0 } },
};

describe("NPC movement verification and replanning", () => {
  it("verifies an expected movement", () => {
    const result: RuntimeMovementResult = { ok: true, reason: "moved", state: { ...state, position: { x: 1, y: 0 } }, actionId: action.id };
    expect(verifyNpcMovement(state, result, { x: 1, y: 0 }).status).toBe("verified");
  });

  it("requests replanning when movement is blocked", () => {
    const result: RuntimeMovementResult = { ok: false, reason: "blocked", state, actionId: action.id };
    expect(verifyNpcMovement(state, result, { x: 1, y: 0 }).status).toBe("replan-required");
  });

  it("requests replanning when actual position differs", () => {
    const result: RuntimeMovementResult = { ok: true, reason: "moved", state: { ...state, position: { x: 2, y: 0 } }, actionId: action.id };
    expect(verifyNpcMovement(state, result, { x: 1, y: 0 }).status).toBe("replan-required");
  });

  it("creates a replacement path from the verified current position", () => {
    const replanned = replanNpcNavigation(action, { ...state, position: { x: 1, y: 0 } }, grid);
    expect(replanned.status).toBe("replan-required");
    expect(replanned.action?.type).toBe("npc.navigate");
    expect((replanned.action?.payload.path as Array<{ x: number; y: number }>).at(-1)).toEqual({ x: 2, y: 0 });
  });

  it("fails closed for a target on another map", () => {
    const crossMap = { ...action, payload: { ...action.payload, targetLocation: { mapId: "other-map", x: 2, y: 0 } } };
    expect(replanNpcNavigation(crossMap, state, grid).status).toBe("rejected");
  });
});
