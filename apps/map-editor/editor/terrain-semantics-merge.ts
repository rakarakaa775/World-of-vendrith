import {
  validateTerrainSemantics,
  type TerrainSemanticRecord,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

export type TerrainSemanticMergeConflict = Readonly<{
  kind: "terrain-semantic-cell";
  id: string;
  x: number;
  y: number;
  base: TerrainSemanticRecord | null;
  local: TerrainSemanticRecord | null;
  remote: TerrainSemanticRecord | null;
}>;

export type TerrainSemanticMergeResult = Readonly<{
  terrainSemantics: TerrainSemanticsSection;
  conflicts: readonly TerrainSemanticMergeConflict[];
}>;

const same = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

function indexCells(section: TerrainSemanticsSection): Map<string, TerrainSemanticRecord> {
  return new Map(section.cells.map((cell) => [`${cell.x},${cell.y}`, cell]));
}

/**
 * Pure three-way merge for sparse terrain-semantic records.
 *
 * Absence is a meaningful value (the coordinate has no explicit semantic
 * record), so deletion participates in the same three-way rules as edits.
 * A conflict returns a deterministic local-side preview plus an explicit
 * conflict record. Callers MUST NOT persist the preview while conflicts exist.
 *
 * Map identity and dimension changes are intentionally outside this helper:
 * the caller must establish that base/local/remote refer to the same map and
 * have the same dimensions before invoking it.
 */
export function mergeTerrainSemanticsThreeWay(
  width: number,
  height: number,
  baseInput: TerrainSemanticsSection,
  localInput: TerrainSemanticsSection,
  remoteInput: TerrainSemanticsSection,
): TerrainSemanticMergeResult {
  const base = validateTerrainSemantics(width, height, baseInput);
  const local = validateTerrainSemantics(width, height, localInput);
  const remote = validateTerrainSemantics(width, height, remoteInput);
  const baseCells = indexCells(base);
  const localCells = indexCells(local);
  const remoteCells = indexCells(remote);
  const coordinates = [...new Set([
    ...baseCells.keys(),
    ...localCells.keys(),
    ...remoteCells.keys(),
  ])].sort((left, right) => {
    const [lx, ly] = left.split(",").map(Number);
    const [rx, ry] = right.split(",").map(Number);
    return ly - ry || lx - rx;
  });

  const cells: TerrainSemanticRecord[] = [];
  const conflicts: TerrainSemanticMergeConflict[] = [];

  for (const id of coordinates) {
    const [x, y] = id.split(",").map(Number);
    const b = baseCells.get(id) ?? null;
    const l = localCells.get(id) ?? null;
    const r = remoteCells.get(id) ?? null;
    let value: TerrainSemanticRecord | null;

    if (same(l, r)) value = l;
    else if (same(l, b)) value = r;
    else if (same(r, b)) value = l;
    else {
      conflicts.push({ kind: "terrain-semantic-cell", id, x, y, base: b, local: l, remote: r });
      value = l;
    }

    if (value) cells.push(value);
  }

  const terrainSemantics = validateTerrainSemantics(width, height, {
    schema: local.schema,
    version: local.version,
    cells,
  });
  return { terrainSemantics, conflicts };
}
