import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { terrainAt, type TerrainKey } from './terrain-engine';
import { terrainJunctionAt, terrainJunctionStrength, type TerrainJunction } from './terrain-junction';

export type TerrainJunctionRenderMode = 'none' | 'edge' | 'dual-corner' | 'triple-corner' | 'quad-corner';

export type TerrainJunctionResolution = {
  junction: TerrainJunction;
  mode: TerrainJunctionRenderMode;
  primaryTerrain: TerrainKey;
  secondaryTerrains: TerrainKey[];
  strength: number;
  directions: Array<'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw'>;
};

const CARDINALS = [
  ['n', 0, -1], ['e', 1, 0], ['s', 0, 1], ['w', -1, 0],
] as const;

function cardinalForeignDirections(document: MapDocument, layerId: string, point: GridPoint, center: TerrainKey) {
  return CARDINALS.flatMap(([direction, dx, dy]) => {
    const terrain = terrainAt(document, { x: point.x + dx, y: point.y + dy }, layerId);
    return terrain && terrain !== center ? [{ direction, terrain }] : [];
  });
}

/** Converts a logical terrain junction into one deterministic renderer plan. */
export function resolveTerrainJunction(document: MapDocument, layerId: string, point: GridPoint): TerrainJunctionResolution | null {
  const junction = terrainJunctionAt(document, layerId, point);
  if (!junction || junction.kind === 'none') return null;

  const cardinal = cardinalForeignDirections(document, layerId, point, junction.centerTerrain);
  const directions = cardinal.map(item => item.direction);
  const secondaryTerrains = junction.priority.slice(0, 3);

  if (junction.kind === 'single') {
    return {
      junction,
      mode: 'edge',
      primaryTerrain: junction.centerTerrain,
      secondaryTerrains,
      strength: terrainJunctionStrength(junction),
      directions,
    };
  }

  if (junction.kind === 'dual') {
    return {
      junction,
      mode: 'dual-corner',
      primaryTerrain: junction.centerTerrain,
      secondaryTerrains,
      strength: terrainJunctionStrength(junction),
      directions,
    };
  }

  if (junction.kind === 'triple') {
    return {
      junction,
      mode: 'triple-corner',
      primaryTerrain: junction.centerTerrain,
      secondaryTerrains,
      strength: terrainJunctionStrength(junction),
      directions,
    };
  }

  return {
    junction,
    mode: 'quad-corner',
    primaryTerrain: junction.centerTerrain,
    secondaryTerrains,
    strength: terrainJunctionStrength(junction),
    directions,
  };
}

export function resolveTerrainJunctionArea(document: MapDocument, layerId: string, points: GridPoint[]): TerrainJunctionResolution[] {
  const result: TerrainJunctionResolution[] = [];
  const seen = new Set<string>();
  for (const point of points) {
    const resolution = resolveTerrainJunction(document, layerId, point);
    if (!resolution) continue;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(resolution);
  }
  return result;
}
