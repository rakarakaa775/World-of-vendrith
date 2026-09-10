import type { GridPoint } from './grid';
import type { TerrainJunctionResolution } from './terrain-junction-resolver';

export type TerrainJunctionGeometry = {
  mode: TerrainJunctionResolution['mode'];
  center: GridPoint;
  strength: number;
  directions: TerrainJunctionResolution['directions'];
  secondaryTerrains: TerrainJunctionResolution['secondaryTerrains'];
};

/**
 * Converts a junction resolution into renderer-neutral geometry metadata.
 * No texture or asset is selected here; this keeps geometry deterministic.
 */
export function terrainJunctionGeometry(
  resolution: TerrainJunctionResolution,
  point: GridPoint,
): TerrainJunctionGeometry {
  return {
    mode: resolution.mode,
    center: point,
    strength: resolution.strength,
    directions: resolution.directions,
    secondaryTerrains: resolution.secondaryTerrains,
  };
}

export function junctionCornerDirections(
  geometry: TerrainJunctionGeometry,
): Array<'ne' | 'se' | 'sw' | 'nw'> {
  if (geometry.mode === 'none' || geometry.mode === 'edge') return [];
  if (geometry.directions.length >= 3) return ['ne', 'se', 'sw', 'nw'];
  if (geometry.directions.length === 2) {
    const pair = new Set(geometry.directions);
    if (pair.has('n') && pair.has('e')) return ['ne'];
    if (pair.has('s') && pair.has('e')) return ['se'];
    if (pair.has('s') && pair.has('w')) return ['sw'];
    if (pair.has('n') && pair.has('w')) return ['nw'];
  }
  return [];
}
