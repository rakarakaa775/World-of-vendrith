export const TERRAIN_SEMANTICS_SCHEMA = "vandrith.terrain-semantics" as const;
export const TERRAIN_SEMANTICS_VERSION = 1 as const;

export type TerrainSurface = "land" | "water";
export type TerrainFeature = "shoreline" | "river" | "lake" | "waterfall" | "ocean_sea" | "none";
export type TerrainDepth = "shallow" | "medium" | "deep" | "unknown";
export type TerrainCurrent = "calm" | "moderate" | "strong" | "unknown";
export type TerrainSemanticRecord = Readonly<{
  x: number; y: number; surface: TerrainSurface; feature?: TerrainFeature;
  depth?: TerrainDepth; current?: TerrainCurrent; shallowWalkable?: boolean;
  bridge?: boolean; crossingPoint?: boolean;
}>;
export type TerrainSemanticsSection = Readonly<{
  schema: typeof TERRAIN_SEMANTICS_SCHEMA; version: typeof TERRAIN_SEMANTICS_VERSION;
  cells: readonly TerrainSemanticRecord[];
}>;

const FEATURES: ReadonlySet<string> = new Set(["shoreline", "river", "lake", "waterfall", "ocean_sea", "none"]);
const DEPTHS: ReadonlySet<string> = new Set(["shallow", "medium", "deep", "unknown"]);
const CURRENTS: ReadonlySet<string> = new Set(["calm", "moderate", "strong", "unknown"]);
const FLAGS = ["shallowWalkable", "bridge", "crossingPoint"] as const;
const FIELDS = new Set(["x", "y", "surface", "feature", "depth", "current", ...FLAGS]);
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function validateTerrainSemantics(width: number, height: number, input: unknown): TerrainSemanticsSection {
  if (!Number.isInteger(width) || width <= 0) throw new Error("Map width must be a positive integer");
  if (!Number.isInteger(height) || height <= 0) throw new Error("Map height must be a positive integer");
  if (!isRecord(input)) throw new Error("Terrain semantics section must be an object");
  if (input.schema !== TERRAIN_SEMANTICS_SCHEMA) throw new Error("Unsupported terrain semantics schema");
  if (input.version !== TERRAIN_SEMANTICS_VERSION) throw new Error("Unsupported terrain semantics version");
  if (!Array.isArray(input.cells)) throw new Error("Terrain semantics cells must be an array");
  const seen = new Set<string>();
  const cells = input.cells.map((raw: unknown, index: number): TerrainSemanticRecord => {
    if (!isRecord(raw)) throw new Error(`Terrain semantic cell ${index} must be an object`);
    const { x, y, surface } = raw;
    if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error(`Terrain semantic cell ${index} coordinates must be integers`);
    if ((x as number) < 0 || (x as number) >= width || (y as number) < 0 || (y as number) >= height) throw new Error(`Terrain semantic cell ${index} is outside map bounds`);
    const key = `${x},${y}`;
    if (seen.has(key)) throw new Error(`Duplicate terrain semantic coordinate: ${key}`);
    seen.add(key);
    if (surface !== "land" && surface !== "water") throw new Error(`Terrain semantic cell ${index} has invalid surface`);
    if (raw.feature !== undefined && (typeof raw.feature !== "string" || !FEATURES.has(raw.feature))) throw new Error(`Terrain semantic cell ${index} has invalid feature`);
    if (raw.depth !== undefined && (typeof raw.depth !== "string" || !DEPTHS.has(raw.depth))) throw new Error(`Terrain semantic cell ${index} has invalid depth`);
    if (raw.current !== undefined && (typeof raw.current !== "string" || !CURRENTS.has(raw.current))) throw new Error(`Terrain semantic cell ${index} has invalid current`);
    for (const flag of FLAGS) if (raw[flag] !== undefined && typeof raw[flag] !== "boolean") throw new Error(`Terrain semantic cell ${index} has invalid ${flag}`);
    if (Object.keys(raw).some((field) => !FIELDS.has(field))) throw new Error(`Terrain semantic cell ${index} contains unknown fields`);
    return {
      x: x as number, y: y as number, surface,
      ...(raw.feature !== undefined ? { feature: raw.feature as TerrainFeature } : {}),
      ...(raw.depth !== undefined ? { depth: raw.depth as TerrainDepth } : {}),
      ...(raw.current !== undefined ? { current: raw.current as TerrainCurrent } : {}),
      ...(raw.shallowWalkable !== undefined ? { shallowWalkable: raw.shallowWalkable as boolean } : {}),
      ...(raw.bridge !== undefined ? { bridge: raw.bridge as boolean } : {}),
      ...(raw.crossingPoint !== undefined ? { crossingPoint: raw.crossingPoint as boolean } : {}),
    };
  });
  return { schema: TERRAIN_SEMANTICS_SCHEMA, version: TERRAIN_SEMANTICS_VERSION, cells };
}

/** Shrinking drops out-of-bounds records; expansion never invents semantics. */
export function resizeTerrainSemantics(section: TerrainSemanticsSection, width: number, height: number): TerrainSemanticsSection {
  if (!Number.isInteger(width) || width <= 0) throw new Error("Map width must be a positive integer");
  if (!Number.isInteger(height) || height <= 0) throw new Error("Map height must be a positive integer");
  return { schema: TERRAIN_SEMANTICS_SCHEMA, version: TERRAIN_SEMANTICS_VERSION,
    cells: section.cells.filter((cell) => cell.x < width && cell.y < height).map((cell) => ({ ...cell })) };
}
