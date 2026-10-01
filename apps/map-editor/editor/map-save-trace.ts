import type { MapDocument } from './map-document';

export type TerrainCellTrace = {
  index: number;
  x: number;
  y: number;
  tileId: string | null;
};

export type TerrainTrace = {
  stage: string;
  mapId: string;
  version: number;
  width: number;
  height: number;
  groundCells: number;
  tileCounts: Record<string, number>;
  cells: TerrainCellTrace[];
};

export function traceTerrain(document: MapDocument, stage: string, version = 0): TerrainTrace {
  const ground = document.layers.find(layer => layer.kind === 'ground');
  const tileCounts: Record<string, number> = {};
  const cells: TerrainCellTrace[] = [];
  for (let index = 0; index < (ground?.cells.length ?? 0); index += 1) {
    const tileId = ground?.cells[index]?.tileId ?? null;
    const tile = tileId ?? 'null';
    tileCounts[tile] = (tileCounts[tile] ?? 0) + 1;
    cells.push({ index, x: index % document.width, y: Math.floor(index / document.width), tileId });
  }
  return { stage, mapId: document.id, version, width: document.width, height: document.height, groundCells: ground?.cells.length ?? 0, tileCounts, cells };
}

export function formatTerrainTrace(trace: TerrainTrace): string {
  const changed = trace.cells.filter(cell => cell.tileId !== null && cell.tileId !== 'deepwater');
  return [
    `stage=${trace.stage}`,
    `map=${trace.mapId}`,
    `version=${trace.version}`,
    `grid=${trace.width}x${trace.height}`,
    `groundCells=${trace.groundCells}`,
    `tiles=${Object.entries(trace.tileCounts).sort(([a], [b]) => a.localeCompare(b)).map(([tile, count]) => `${tile}:${count}`).join(',')}`,
    `cells=${changed.slice(0, 32).map(cell => `${cell.index}@${cell.x},${cell.y}:${cell.tileId}`).join(',') || 'none'}`,
    changed.length > 32 ? `cellsTruncated=${changed.length - 32}` : '',
  ].filter(Boolean).join(' | ');
}

export function assertTerrainPreserved(before: TerrainTrace, after: TerrainTrace, label: string): void {
  if (before.mapId !== after.mapId) throw new Error(`SAVE_TERRAIN_IDENTITY_MISMATCH: ${label}: before=${before.mapId}; after=${after.mapId}`);
  if (before.width !== after.width || before.height !== after.height) throw new Error(`SAVE_TERRAIN_GRID_MISMATCH: ${label}: before=${before.width}x${before.height}; after=${after.width}x${after.height}`);
  const beforeCells = new Map(before.cells.map(cell => [cell.index, cell.tileId]));
  const afterCells = new Map(after.cells.map(cell => [cell.index, cell.tileId]));
  const indices = new Set([...beforeCells.keys(), ...afterCells.keys()]);
  for (const index of indices) {
    if ((beforeCells.get(index) ?? null) !== (afterCells.get(index) ?? null)) {
      throw new Error(`SAVE_TERRAIN_CELL_MISMATCH: ${label}: index=${index}; before=${beforeCells.get(index) ?? 'null'}; after=${afterCells.get(index) ?? 'null'}`);
    }
  }
  const keys = new Set([...Object.keys(before.tileCounts), ...Object.keys(after.tileCounts)]);
  for (const key of keys) {
    if ((before.tileCounts[key] ?? 0) !== (after.tileCounts[key] ?? 0)) {
      throw new Error(`SAVE_TERRAIN_PAYLOAD_MISMATCH: ${label}: tile=${key}; before=${before.tileCounts[key] ?? 0}; after=${after.tileCounts[key] ?? 0}`);
    }
  }
}

export function assertSaveIdentity(local: MapDocument, connected: MapDocument, label: string): void {
  if (local.id !== connected.id || local.mapType !== connected.mapType) {
    throw new Error(`SAVE_DOCUMENT_IDENTITY_MISMATCH: ${label}: local=${local.id}/${local.mapType}; connected=${connected.id}/${connected.mapType}`);
  }
}
