import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { terrainAt, type TerrainKey } from './terrain-engine';

export type TerrainJunctionKind = 'none' | 'single' | 'dual' | 'triple' | 'quad';

export type TerrainJunction = {
  point: GridPoint;
  centerTerrain: TerrainKey;
  terrains: TerrainKey[];
  kind: TerrainJunctionKind;
  cardinal: Record<'n' | 'e' | 's' | 'w', TerrainKey | null>;
  diagonal: Record<'ne' | 'se' | 'sw' | 'nw', TerrainKey | null>;
  priority: TerrainKey[];
};

const CARDINALS = [
  ['n', 0, -1], ['e', 1, 0], ['s', 0, 1], ['w', -1, 0],
] as const;

const DIAGONALS = [
  ['ne', 1, -1], ['se', 1, 1], ['sw', -1, 1], ['nw', -1, -1],
] as const;

function terrainAtOffset(document: MapDocument, layerId: string, point: GridPoint, dx: number, dy: number): TerrainKey | null {
  return terrainAt(document, { x: point.x + dx, y: point.y + dy }, layerId);
}

function uniqueTerrains(values: Array<TerrainKey | null>): TerrainKey[] {
  return [...new Set(values.filter((value): value is TerrainKey => value !== null))];
}

/**
 * Classifies the local terrain composition around a cell without selecting
 * texture assets. The resolver is intentionally deterministic and data-only.
 */
export function terrainJunctionAt(document: MapDocument, layerId: string, point: GridPoint): TerrainJunction | null {
  const centerTerrain = terrainAt(document, point, layerId);
  if (!centerTerrain) return null;

  const cardinal = Object.fromEntries(
    CARDINALS.map(([direction, dx, dy]) => [direction, terrainAtOffset(document, layerId, point, dx, dy)]),
  ) as TerrainJunction['cardinal'];
  const diagonal = Object.fromEntries(
    DIAGONALS.map(([direction, dx, dy]) => [direction, terrainAtOffset(document, layerId, point, dx, dy)]),
  ) as TerrainJunction['diagonal'];

  const terrains = uniqueTerrains([centerTerrain, ...Object.values(cardinal), ...Object.values(diagonal)]);
  const surrounding = uniqueTerrains([...Object.values(cardinal), ...Object.values(diagonal)]);
  const foreign = surrounding.filter(terrain => terrain !== centerTerrain);

  let kind: TerrainJunctionKind = 'none';
  if (foreign.length === 0) kind = 'none';
  else if (foreign.length === 1) kind = 'single';
  else if (foreign.length === 2) kind = 'dual';
  else if (foreign.length === 3) kind = 'triple';
  else kind = 'quad';

  const counts = new Map<TerrainKey, number>();
  for (const terrain of [...Object.values(cardinal), ...Object.values(diagonal)]) {
    if (!terrain || terrain === centerTerrain) continue;
    counts.set(terrain, (counts.get(terrain) ?? 0) + 1);
  }
  const priority = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([terrain]) => terrain);

  return { point, centerTerrain, terrains, kind, cardinal, diagonal, priority };
}

export function terrainJunctionSignature(junction: TerrainJunction): string {
  const cardinal = ['n', 'e', 's', 'w']
    .map(direction => junction.cardinal[direction as keyof TerrainJunction['cardinal']] ?? '_')
    .join(',');
  const diagonal = ['ne', 'se', 'sw', 'nw']
    .map(direction => junction.diagonal[direction as keyof TerrainJunction['diagonal']] ?? '_')
    .join(',');
  return `${junction.centerTerrain}|${junction.kind}|${cardinal}|${diagonal}`;
}

export function terrainJunctionStrength(junction: TerrainJunction): number {
  switch (junction.kind) {
    case 'single': return 0.28;
    case 'dual': return 0.22;
    case 'triple': return 0.18;
    case 'quad': return 0.14;
    default: return 0;
  }
}

export function terrainJunctionsForPoints(document: MapDocument, layerId: string, points: GridPoint[]): TerrainJunction[] {
  const result: TerrainJunction[] = [];
  const seen = new Set<string>();
  for (const point of points) {
    const junction = terrainJunctionAt(document, layerId, point);
    if (!junction || junction.kind === 'none') continue;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(junction);
  }
  return result;
}
