import type { MapDocument } from './map-document';
import { terrainFromTileId, type TerrainKey } from './terrain-engine';

/**
 * Water depth is a derived render projection, not canonical MapDocument state.
 * This module deliberately returns a separate immutable grid and never writes
 * derived bands into document.layers[].cells[].tileId.
 *
 * Compatibility note: schema-v1 snapshots may already contain water-band IDs.
 * This function treats all known water-band IDs as water input, but it cannot
 * recover whether any such ID was authored or materialized by an older engine.
 * Legacy normalization must therefore be a separate, explicit migration.
 */
export type WaterBandTileId = 'water' | 'brackish' | 'deepwater2' | 'deepwater';
export type WaterProjection = Readonly<{
  algorithmVersion: 1;
  mapId: string;
  layerId: string;
  width: number;
  height: number;
  /** Row-major; null means this cell is not recognized as a water cell. */
  bands: readonly (WaterBandTileId | null)[];
}>;

export const WATER_PROJECTION_SHORE_DISTANCE = 1;
export const WATER_PROJECTION_BRACKISH_DISTANCE = 2;
export const WATER_PROJECTION_MID_DISTANCE = 4;

const WATER_TERRAINS = new Set<TerrainKey>(['water', 'brackish', 'deepwater2', 'deepwater']);

function isWaterTerrain(terrain: TerrainKey | null): terrain is WaterBandTileId {
  return terrain !== null && WATER_TERRAINS.has(terrain);
}

/**
 * Derives a deterministic 8-neighbor distance-to-land water band grid.
 * The returned projection is not part of MapDocument and must not be saved as
 * canonical authored terrain or emitted as a world mutation.
 */
export function deriveWaterProjection(
  document: MapDocument,
  layerId: string,
): WaterProjection | null {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.kind !== 'ground') return null;

  const size = document.width * document.height;
  const distance = new Int32Array(size);
  distance.fill(-1);
  const queue: number[] = [];
  let head = 0;

  for (let index = 0; index < size; index += 1) {
    const terrain = terrainFromTileId(layer.cells[index]?.tileId ?? null);
    if (terrain !== null && !isWaterTerrain(terrain)) {
      distance[index] = 0;
      queue.push(index);
    }
  }

  const hasLand = queue.length > 0;
  const bands: (WaterBandTileId | null)[] = Array.from({ length: size }, () => null);

  // World maps retain a visual deep-water floor even when no land exists.
  // This is a projection-only rule: canonical cells remain untouched.
  if (!hasLand) {
    if (document.mapType === 'world') {
      for (let index = 0; index < size; index += 1) {
        const terrain = terrainFromTileId(layer.cells[index]?.tileId ?? null);
        if (isWaterTerrain(terrain)) bands[index] = 'deepwater';
      }
    }
    return {
      algorithmVersion: 1,
      mapId: document.id,
      layerId,
      width: document.width,
      height: document.height,
      bands,
    };
  }

  while (head < queue.length) {
    const index = queue[head++];
    const x = index % document.width;
    const y = Math.floor(index / document.width);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= document.width || ny >= document.height) continue;
        const nextIndex = ny * document.width + nx;
        if (distance[nextIndex] !== -1) continue;
        distance[nextIndex] = distance[index] + 1;
        queue.push(nextIndex);
      }
    }
  }

  for (let index = 0; index < size; index += 1) {
    const terrain = terrainFromTileId(layer.cells[index]?.tileId ?? null);
    if (!isWaterTerrain(terrain)) continue;
    const d = distance[index];
    bands[index] =
      d <= WATER_PROJECTION_SHORE_DISTANCE ? 'water' :
      d <= WATER_PROJECTION_BRACKISH_DISTANCE ? 'brackish' :
      d <= WATER_PROJECTION_MID_DISTANCE ? 'deepwater2' :
      'deepwater';
  }

  return {
    algorithmVersion: 1,
    mapId: document.id,
    layerId,
    width: document.width,
    height: document.height,
    bands,
  };
}
