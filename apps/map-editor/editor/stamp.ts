import type { MapDocument } from './map-document';
import { indexFor } from './grid';

export type StampCell = { dx: number; dy: number; tileId: string | null };
export type Stamp = { width: number; height: number; cells: StampCell[] };

export function createStamp(document: MapDocument, layerId: string, x: number, y: number, width: number, height: number): Stamp {
  const layer = document.layers.find(item => item.id === layerId);
  const cells: StampCell[] = [];
  for (let dy = 0; dy < height; dy++) for (let dx = 0; dx < width; dx++) {
    const px = x + dx, py = y + dy;
    const cell = layer && px >= 0 && py >= 0 && px < document.width && py < document.height ? layer.cells[indexFor({ x: px, y: py }, document.width)] : undefined;
    cells.push({ dx, dy, tileId: cell?.tileId ?? null });
  }
  return { width, height, cells };
}

export function applyStamp(document: MapDocument, layerId: string, originX: number, originY: number, stamp: Stamp): MapDocument {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return document;
  const cells = [...layer.cells];
  while (cells.length < document.width * document.height) cells.push({ tileId: null });
  for (const cell of stamp.cells) {
    const x = originX + cell.dx, y = originY + cell.dy;
    if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
    cells[indexFor({ x, y }, document.width)] = { tileId: cell.tileId };
  }
  return { ...document, layers: document.layers.map(item => item.id === layerId ? { ...item, cells } : item) };
}
