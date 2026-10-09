export interface NavigationPoint { x: number; y: number; }

export interface NavigationGrid {
  width: number;
  height: number;
  blocked: boolean[];
}

export interface DynamicNavigationObstacle {
  entityId: string;
  mapId: string;
  position: NavigationPoint;
  blocksMovement: boolean;
}

export interface NavigationPath {
  points: NavigationPoint[];
  cost: number;
}

export interface NavigationPlan {
  found: boolean;
  start: NavigationPoint;
  goal: NavigationPoint;
  path: NavigationPoint[];
  cost?: number;
  reason: string;
}


/** Authored water semantics for one map cell; never infer these from render bands. */
export interface NavigationWaterCell {
  x: number;
  y: number;
  surface: "land" | "water";
  feature?: "shoreline" | "river" | "lake" | "waterfall" | "ocean_sea" | "none";
  depth?: "shallow" | "medium" | "deep" | "unknown";
  current?: "calm" | "moderate" | "strong" | "unknown";
  shallowWalkable?: boolean;
  bridge?: boolean;
  crossingPoint?: boolean;
}

export interface NavigationCapabilities {
  canSwim?: boolean;
  hasWaterTransport?: boolean;
}
