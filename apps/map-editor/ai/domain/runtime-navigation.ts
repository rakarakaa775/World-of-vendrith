export interface NavigationPoint { x: number; y: number; }

export interface NavigationGrid {
  width: number;
  height: number;
  /** Cells blocked by collision geometry; water policy must never erase these. */
  blocked: boolean[];
  /** Optional authored water semantics. Absent entries mean no water policy can be inferred. */
  waterCells?: NavigationWaterCell[];
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


export type NavigationWaterValidation =
  | { valid: true; cells: NavigationWaterCell[] }
  | { valid: false; errors: string[] };

/**
 * Validates an untrusted authored water-cell payload before projection into a
 * navigation grid. This is intentionally pure and does not infer semantics
 * from visual terrain IDs or silently discard invalid records.
 */
export function validateNavigationWaterCells(
  width: number,
  height: number,
  input: unknown,
): NavigationWaterValidation {
  const errors: string[] = [];
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    return { valid: false, errors: ["Map dimensions must be positive integers."] };
  }
  if (!Array.isArray(input)) {
    return { valid: false, errors: ["Water cells must be an array."] };
  }

  const features = new Set(["shoreline", "river", "lake", "waterfall", "ocean_sea", "none"]);
  const depths = new Set(["shallow", "medium", "deep", "unknown"]);
  const currents = new Set(["calm", "moderate", "strong", "unknown"]);
  const seen = new Set<string>();
  const cells: NavigationWaterCell[] = [];

  input.forEach((value: unknown, index: number) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`Water cell ${index} must be an object.`);
      return;
    }
    const cell = value as Record<string, unknown>;
    const { x, y, surface, feature, depth, current, shallowWalkable, bridge, crossingPoint } = cell;
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      errors.push(`Water cell ${index} coordinates must be integers.`);
      return;
    }
    if ((x as number) < 0 || (y as number) < 0 || (x as number) >= width || (y as number) >= height) {
      errors.push(`Water cell ${index} is outside map bounds.`);
      return;
    }
    const coordinate = `${x}:${y}`;
    if (seen.has(coordinate)) {
      errors.push(`Duplicate water cell coordinate ${coordinate}.`);
      return;
    }
    seen.add(coordinate);

    if (surface !== "land" && surface !== "water") errors.push(`Water cell ${index} has invalid surface.`);
    if (feature !== undefined && (typeof feature !== "string" || !features.has(feature))) errors.push(`Water cell ${index} has invalid feature.`);
    if (depth !== undefined && (typeof depth !== "string" || !depths.has(depth))) errors.push(`Water cell ${index} has invalid depth.`);
    if (current !== undefined && (typeof current !== "string" || !currents.has(current))) errors.push(`Water cell ${index} has invalid current.`);
    for (const flag of ["shallowWalkable", "bridge", "crossingPoint"] as const) {
      if (cell[flag] !== undefined && typeof cell[flag] !== "boolean") {
        errors.push(`Water cell ${index} field ${flag} must be boolean.`);
      }
    }
    if (
      (surface === "land" || surface === "water") &&
      (feature === undefined || typeof feature === "string" && features.has(feature)) &&
      (depth === undefined || typeof depth === "string" && depths.has(depth)) &&
      (current === undefined || typeof current === "string" && currents.has(current)) &&
      ["shallowWalkable", "bridge", "crossingPoint"].every(flag => cell[flag] === undefined || typeof cell[flag] === "boolean")
    ) {
      cells.push({
        x: x as number,
        y: y as number,
        surface,
        ...(feature !== undefined ? { feature: feature as NavigationWaterCell["feature"] } : {}),
        ...(depth !== undefined ? { depth: depth as NavigationWaterCell["depth"] } : {}),
        ...(current !== undefined ? { current: current as NavigationWaterCell["current"] } : {}),
        ...(shallowWalkable !== undefined ? { shallowWalkable: shallowWalkable as boolean } : {}),
        ...(bridge !== undefined ? { bridge: bridge as boolean } : {}),
        ...(crossingPoint !== undefined ? { crossingPoint: crossingPoint as boolean } : {}),
      });
    }
  });

  return errors.length ? { valid: false, errors } : { valid: true, cells };
}
