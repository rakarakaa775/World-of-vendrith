import type { NavigationPoint } from "./runtime-navigation";

export interface RuntimeMovementState {
  entityId: string;
  mapId: string;
  position: NavigationPoint;
  stateVersion: string;
  /** Authenticated actor capabilities are authoritative for execution-time traversal checks. */
  canSwim?: boolean;
  hasWaterTransport?: boolean;
}

export interface MovementStep {
  from: NavigationPoint;
  to: NavigationPoint;
  remaining: NavigationPoint[];
}

export type MovementResultReason =
  | "moved"
  | "arrived"
  | "blocked"
  | "stale-state"
  | "invalid-action";

export interface RuntimeMovementResult {
  ok: boolean;
  reason: MovementResultReason;
  state: RuntimeMovementState;
  actionId: string;
}

export interface RuntimeMovementActionPayload {
  path: NavigationPoint[];
  targetLocation?: { mapId?: string; x: number; y: number };
}
