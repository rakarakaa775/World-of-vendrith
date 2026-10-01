import type { MapDocument } from './map-document';

export type TerrainTrace = {
  stage: string;
  mapId: string;
  version: number;
  width: number;
  height: number;
  groundCells: number;
  tileCounts: Record<string, number>;
};

export function traceTerrain(document: MapDocument, stage: string, version = 0): TerrainTrace {
  const ground = document.layers.find(layer => layer.kind === 'ground');
  const tileCounts: Record<string, number> = {};
  for (const cell of ground?.cells ?? []) {
    const tile = cell.tileId ?? 'null';
    tileCounts[tile] = (tileCounts[tile] ?? 0) + 1;
  }
  return {
    stage,
    mapId: document.id,
    version,
    width: document.width,
    height: document.height,
    groundCells: ground?.cells.length ?? 0,
    tileCounts,
  };
}

export function formatTerrainTrace(trace: TerrainTrace): string {
  return [
    `stage=${trace.stage}`,
    `map=${trace.mapId}`,
    `version=${trace.version}`,
    `grid=${trace.width}x${trace.height}`,
    `groundCells=${trace.groundCells}`,
    `tiles=${Object.entries(trace.tileCounts).sort(([a], [b]) => a.localeCompare(b)).map(([tile, count]) => `${tile}:${count}`).join(',')}`,
  ].join(' | ');
}

export function assertTerrainPreserved(
  before: TerrainTrace,
  after: TerrainTrace,
  label: string,
): void {
  const keys = new Set([...Object.keys(before.tileCounts), ...Object.keys(after.tileCounts)]);
  for (const key of keys) {
    if ((before.tileCounts[key] ?? 0) !== (after.tileCounts[key] ?? 0)) {
      throw new Error(
        `SAVE_TERRAIN_PAYLOAD_MISMATCH: ${label}: tile=${key}; before=${before.tileCounts[key] ?? 0}; after=${after.tileCounts[key] ?? 0}`,
      );
    }
  }
}
