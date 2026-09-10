import type { MapDocument, MapLayer } from './map-document';
import type { Selection } from './selection';
import { indexFor } from './grid';

function selectedCells(layer: MapLayer, document: MapDocument, selection: Selection) {
  const cells = [] as { x: number; y: number; tileId: string | null }[];
  for (let y = selection.y; y < selection.y + selection.height; y += 1) {
    for (let x = selection.x; x < selection.x + selection.width; x += 1) {
      if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
      cells.push({ x: x - selection.x, y: y - selection.y, tileId: layer.cells[indexFor({ x, y }, document.width)]?.tileId ?? null });
    }
  }
  return cells;
}

export type TileSelectionClipboard = { width: number; height: number; cells: { x: number; y: number; tileId: string | null }[] };

export function copyTileSelection(document: MapDocument, layerId: string, selection: Selection): TileSelectionClipboard | null {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return null;
  return { width: selection.width, height: selection.height, cells: selectedCells(layer, document, selection) };
}

export function pasteTileSelection(document: MapDocument, layerId: string, origin: { x: number; y: number }, clipboard: TileSelectionClipboard): MapDocument {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.locked || !layer.visible) return document;
  let next = document;
  for (const cell of clipboard.cells) {
    const x = origin.x + cell.x, y = origin.y + cell.y;
    if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
    const cells = next.layers.find(item => item.id === layerId)?.cells ?? [];
    const index = indexFor({ x, y }, document.width);
    const expanded = [...cells];
    while (expanded.length < document.width * document.height) expanded.push({ tileId: null });
    expanded[index] = { tileId: cell.tileId };
    next = { ...next, layers: next.layers.map(item => item.id === layerId ? { ...item, cells: expanded } : item) };
  }
  return next;
}
