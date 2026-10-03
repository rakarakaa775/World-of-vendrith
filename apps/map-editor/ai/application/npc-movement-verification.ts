import type { RuntimeAction } from "../domain/runtime";
import type { NavigationGrid, NavigationPoint } from "../domain/runtime-navigation";
import type { RuntimeMovementResult, RuntimeMovementState } from "../domain/runtime-movement";
import { executeNpcMovementStep } from "./npc-movement";
import { findNavigationPath, createNpcNavigationAction } from "./npc-navigation";

export type MovementVerificationStatus = "verified" | "replan-required" | "arrived" | "rejected";

export interface MovementVerification {
  status: MovementVerificationStatus;
  expected: NavigationPoint;
  actual: NavigationPoint;
  detail: string;
}

export interface MovementReplan {
  action?: RuntimeAction;
  status: MovementVerificationStatus;
  verification: MovementVerification;
}

export function verifyNpcMovement(
  previous: RuntimeMovementState,
  result: RuntimeMovementResult,
  expected: NavigationPoint,
): MovementVerification {
  if (!result.ok) {
    return {
      status: result.reason === "blocked" ? "replan-required" : "rejected",
      expected,
      actual: result.state.position,
      detail: result.reason === "blocked"
        ? "The next waypoint became blocked; a new path is required."
        : "Movement was rejected before the expected waypoint could be reached.",
    };
  }

  if (result.state.position.x === expected.x && result.state.position.y === expected.y) {
    return {
      status: result.reason === "arrived" ? "arrived" : "verified",
      expected,
      actual: result.state.position,
      detail: result.reason === "arrived" ? "NPC reached the navigation target." : "NPC reached the expected waypoint.",
    };
  }

  return {
    status: "replan-required",
    expected,
    actual: result.state.position,
    detail: "Actual NPC position differs from the expected waypoint.",
  };
}

export function replanNpcNavigation(
  action: RuntimeAction,
  state: RuntimeMovementState,
  grid: NavigationGrid,
): MovementReplan {
  const payload = action.payload as { targetLocation?: { mapId?: string; x: number; y: number } };
  const target = payload.targetLocation;
  if (!target || target.mapId !== state.mapId) {
    return {
      status: "rejected",
      verification: {
        status: "rejected",
        expected: state.position,
        actual: state.position,
        detail: "Replanning requires a target on the NPC's current map.",
      },
    };
  }

  const path = findNavigationPath(grid, state.position, { x: target.x, y: target.y });
  if (!path) {
    return {
      status: "replan-required",
      verification: {
        status: "replan-required",
        expected: { x: target.x, y: target.y },
        actual: state.position,
        detail: "No replacement walkable path exists to the target.",
      },
    };
  }

  const replacementObservation = {
    id: action.id + ":replan-observation",
    surface: "game" as const,
    intelligence: "npc" as const,
    state: {
      worldId: "runtime",
      clock: { tick: 0, day: 0, hour: 0, minute: 0, season: "unknown" },
      activeEventIds: [],
      stateVersion: state.stateVersion,
    },
    perception: {
      self: { id: state.entityId, kind: "npc" as const, mapId: state.mapId, position: state.position },
      nearbyEntities: [],
      detections: [],
      visibleMapIds: [state.mapId],
      environment: {},
    },
    facts: [],
  };

  const replacement = createNpcNavigationAction(
    replacementObservation,
    { found: true, start: state.position, goal: { x: target.x, y: target.y }, path: path.points, cost: path.cost, reason: "Replacement path generated after movement verification." },
  );

  return {
    status: "replan-required",
    action: replacement,
    verification: {
      status: "replan-required",
      expected: { x: target.x, y: target.y },
      actual: state.position,
      detail: "A replacement path was generated from the NPC's verified current position.",
    },
  };
}
