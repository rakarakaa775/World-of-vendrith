import type { RuntimeAction } from "../domain/runtime";
import type { NavigationGrid, NavigationPoint } from "../domain/runtime-navigation";
import type { RuntimeMovementActionPayload, RuntimeMovementResult, RuntimeMovementState } from "../domain/runtime-movement";

function samePoint(a: NavigationPoint, b: NavigationPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

function inBounds(grid: NavigationGrid, point: NavigationPoint): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < grid.width && point.y < grid.height;
}

function isAdjacent(a: NavigationPoint, b: NavigationPoint): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

export function executeNpcMovementStep(
  action: RuntimeAction,
  current: RuntimeMovementState,
  grid: NavigationGrid,
  expectedStateVersion: string,
): RuntimeMovementResult {
  if (action.type !== "npc.navigate" || action.intelligence !== "npc" || action.risk !== "safe") {
    return { ok: false, reason: "invalid-action", state: current, actionId: action.id };
  }
  if (current.stateVersion !== expectedStateVersion) {
    return { ok: false, reason: "stale-state", state: current, actionId: action.id };
  }

  const payload = action.payload as unknown as RuntimeMovementActionPayload;
  if (!Array.isArray(payload.path) || payload.path.length === 0) {
    return { ok: false, reason: "invalid-action", state: current, actionId: action.id };
  }

  const currentIndex = payload.path.findIndex(point => samePoint(point, current.position));
  if (currentIndex < 0) {
    return { ok: false, reason: "invalid-action", state: current, actionId: action.id };
  }

  if (currentIndex === payload.path.length - 1) {
    return { ok: true, reason: "arrived", state: current, actionId: action.id };
  }

  const next = payload.path[currentIndex + 1];
  if (!inBounds(grid, next) || grid.blocked[next.y * grid.width + next.x] || !isAdjacent(current.position, next)) {
    return { ok: false, reason: "blocked", state: current, actionId: action.id };
  }

  const targetMapId = payload.targetLocation?.mapId;
  if (targetMapId && targetMapId !== current.mapId) {
    return { ok: false, reason: "invalid-action", state: current, actionId: action.id };
  }

  const nextState: RuntimeMovementState = {
    ...current,
    position: next,
  };

  return {
    ok: true,
    reason: currentIndex + 1 === payload.path.length - 1 ? "arrived" : "moved",
    state: nextState,
    actionId: action.id,
  };
}
