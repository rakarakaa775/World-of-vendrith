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
