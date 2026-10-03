import type { MapDocument } from "../../editor/map-document";
import type { RuntimeAction, RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { DynamicNavigationObstacle, NavigationGrid, NavigationPath, NavigationPlan, NavigationPoint } from "../domain/runtime-navigation";
import { createRuntimeDecision } from "./runtime-decision";
import { effectiveNpcEnvironmentConditions } from "./npc-environment-policy-runtime";

const DIRECTIONS: NavigationPoint[] = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
];

function key(point: NavigationPoint): string {
  return point.x + ":" + point.y;
}

function inBounds(grid: NavigationGrid, point: NavigationPoint): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < grid.width && point.y < grid.height;
}

function index(grid: NavigationGrid, point: NavigationPoint): number {
  return point.y * grid.width + point.x;
}

function heuristic(a: NavigationPoint, b: NavigationPoint): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstruct(cameFrom: Map<string, NavigationPoint>, current: NavigationPoint): NavigationPoint[] {
  const path = [current];
  let cursor = current;
  while (cameFrom.has(key(cursor))) {
    cursor = cameFrom.get(key(cursor))!;
    path.push(cursor);
  }
  return path.reverse();
}

export function applyDynamicNavigationObstacles(
  grid: NavigationGrid,
  obstacles: DynamicNavigationObstacle[],
  selfEntityId?: string,
  mapId?: string,
  ignoredEntityIds: readonly string[] = [],
): NavigationGrid {
  const blocked = [...grid.blocked];
  const ignored = new Set(ignoredEntityIds);
  for (const obstacle of obstacles) {
    if (!obstacle.blocksMovement || obstacle.entityId === selfEntityId || ignored.has(obstacle.entityId) || (mapId && obstacle.mapId !== mapId)) continue;
    if (!inBounds(grid, obstacle.position)) continue;
    blocked[index(grid, obstacle.position)] = true;
  }
  return { ...grid, blocked };
}

export function dynamicNavigationObstaclesFromObservation(observation: RuntimeObservation): DynamicNavigationObstacle[] {
  return (observation.perception?.nearbyEntities ?? []).map(entity => ({
    entityId: entity.id,
    mapId: entity.mapId,
    position: entity.position,
    blocksMovement: entity.state?.blocksMovement !== false,
  }));
}

export function findNavigationPath(
  grid: NavigationGrid,
  start: NavigationPoint,
  goal: NavigationPoint,
): NavigationPath | undefined {
  if (!inBounds(grid, start) || !inBounds(grid, goal)) return undefined;
  if (grid.blocked[index(grid, start)] || grid.blocked[index(grid, goal)]) return undefined;

  const open = new Map<string, { point: NavigationPoint; f: number; g: number }>();
  const closed = new Set<string>();
  const cameFrom = new Map<string, NavigationPoint>();
  const gScore = new Map<string, number>();
  gScore.set(key(start), 0);
  open.set(key(start), { point: start, f: heuristic(start, goal), g: 0 });

  while (open.size) {
    let current = [...open.values()].sort((a, b) => a.f - b.f || a.g - b.g || key(a.point).localeCompare(key(b.point)))[0];
    open.delete(key(current.point));

    if (key(current.point) === key(goal)) {
      const path = reconstruct(cameFrom, current.point);
      return { points: path, cost: path.length - 1 };
    }

    closed.add(key(current.point));

    for (const direction of DIRECTIONS) {
      const neighbor = { x: current.point.x + direction.x, y: current.point.y + direction.y };
      if (!inBounds(grid, neighbor) || grid.blocked[index(grid, neighbor)] || closed.has(key(neighbor))) continue;

      const tentativeG = current.g + 1;
      const neighborKey = key(neighbor);
      const previousG = gScore.get(neighborKey);
      if (previousG !== undefined && tentativeG >= previousG) continue;

      cameFrom.set(neighborKey, current.point);
      gScore.set(neighborKey, tentativeG);
      open.set(neighborKey, { point: neighbor, g: tentativeG, f: tentativeG + heuristic(neighbor, goal) });
    }
  }

  return undefined;
}

export function navigationGridFromMap(document: MapDocument, layerId = "collision"): NavigationGrid {
  const layer = document.layers.find(item => item.id === layerId);
  const blocked = Array.from({ length: document.width * document.height }, () => false);
  if (layer?.kind === "collision") {
    layer.cells.forEach((cell, cellIndex) => {
      blocked[cellIndex] = Boolean(cell.tileId);
    });
    layer.objects.forEach(object => {
      if (!object.collision) return;
      for (let y = object.y; y < object.y + object.height; y += 1) {
        for (let x = object.x; x < object.x + object.width; x += 1) {
          if (x >= 0 && y >= 0 && x < document.width && y < document.height) blocked[y * document.width + x] = true;
        }
      }
    });
  }
  return { width: document.width, height: document.height, blocked };
}

function navigationEnvironmentRule(observation: RuntimeObservation): Record<string, unknown> | undefined {
  const value = effectiveNpcEnvironmentConditions(observation).npc_movement;
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function movementCostMultiplier(observation: RuntimeObservation): number {
  const rule = navigationEnvironmentRule(observation);
  const value = rule?.cost_multiplier;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 1;
}

export function createNavigationPlan(
  observation: RuntimeObservation,
  grid: NavigationGrid,
  goal: NavigationPoint,
  dynamicObstacles: DynamicNavigationObstacle[] = dynamicNavigationObstaclesFromObservation(observation),
  ignoredEntityIds: readonly string[] = [],
): NavigationPlan {
  const self = observation.perception?.self;
  const start = self?.position;
  if (!self || self.kind !== "npc" || !start) {
    return { found: false, start: start ?? goal, goal, path: [], reason: "Navigation requires an NPC self entity with a position." };
  }
  const navigationGrid = applyDynamicNavigationObstacles(grid, dynamicObstacles, self.id, self.mapId, ignoredEntityIds);
  const result = findNavigationPath(navigationGrid, start, goal);
  if (!result) return { found: false, start, goal, path: [], reason: "No walkable path exists between the NPC and the target." };
  const multiplier = movementCostMultiplier(observation);
  const cost = result.cost * multiplier;
  const rule = navigationEnvironmentRule(observation);
  const reason = rule?.cost_multiplier !== undefined
    ? "A walkable path was found with an explicit environment movement-cost rule."
    : "A walkable path was found using deterministic grid navigation.";
  return { found: true, start, goal, path: result.points, cost, reason };
}

export function createNpcNavigationAction(observation: RuntimeObservation, plan: NavigationPlan): RuntimeAction | undefined {
  if (!plan.found) return undefined;
  return {
    id: observation.id + ":navigate:" + plan.goal.x + ":" + plan.goal.y,
    intelligence: "npc",
    type: "npc.navigate",
    payload: { entityId: observation.perception?.self?.id, path: plan.path, targetLocation: { mapId: observation.perception?.self?.mapId, x: plan.goal.x, y: plan.goal.y }, cost: plan.cost },
    risk: "safe",
    reason: plan.reason,
  };
}

export function decideNpcNavigation(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  grid: NavigationGrid,
  goal: NavigationPoint,
  ignoredEntityIds: readonly string[] = [],
): RuntimeDecision | undefined {
  const plan = createNavigationPlan(observation, grid, goal, undefined, ignoredEntityIds);
  const action = createNpcNavigationAction(observation, plan);
  if (!action) return undefined;
  return createRuntimeDecision(request, observation, {
    actions: [action],
    evidence: observation.facts,
    expiresAtTick: observation.state.clock.tick + 1,
  });
}
