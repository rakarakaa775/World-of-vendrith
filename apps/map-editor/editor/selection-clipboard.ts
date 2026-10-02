import type { MapDocument } from "./map-document";
import type { Selection } from "./selection";

export type SelectionClipboard = {
  width: number;
  height: number;
  cells: Array<{ tileId: string | null }>;
};

export function copySelection(
  document: MapDocument,
  layerId: string,
  selection: Selection,
): SelectionClipboard {
  const layer = document.layers.find(item => item.id === layerId);
  const cells: Array<{ tileId: string | null }> = [];
  for (let y = 0; y < selection.height; y += 1) {
    for (let x = 0; x < selection.width; x += 1) {
      const gx = selection.x + x;
      const gy = selection.y + y;
      const inside = gx >= 0 && gy >= 0 && gx < document.width && gy < document.height;
      cells.push({ tileId: inside ? (layer?.cells[gy * document.width + gx]?.tileId ?? null) : null });
    }
  }
  return { width: selection.width, height: selection.height, cells };
}

export function pasteSelection(
  document: MapDocument,
  layerId: string,
  clipboard: SelectionClipboard,
  destination: { x: number; y: number },
): MapDocument {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.locked || !layer.visible) return document;
  const cells = [...layer.cells];
  while (cells.length < document.width * document.height) cells.push({ tileId: null });

  for (let y = 0; y < clipboard.height; y += 1) {
    for (let x = 0; x < clipboard.width; x += 1) {
      const gx = destination.x + x;
      const gy = destination.y + y;
      if (gx < 0 || gy < 0 || gx >= document.width || gy >= document.height) continue;
      const source = clipboard.cells[y * clipboard.width + x];
      cells[gy * document.width + gx] = { tileId: source?.tileId ?? null };
    }
  }

  return {
    ...document,
    layers: document.layers.map(item => item.id === layerId ? { ...item, cells } : item),
  };
}

export function moveSelection(
  document: MapDocument,
  layerId: string,
  selection: Selection,
  delta: { x: number; y: number },
): { document: MapDocument; selection: Selection } {
  const destination = { x: selection.x + delta.x, y: selection.y + delta.y };
  const clipboard = copySelection(document, layerId, selection);
  const blank = {
    width: clipboard.width,
    height: clipboard.height,
    cells: clipboard.cells.map(() => ({ tileId: null })),
  };
  const cleared = pasteSelection(document, layerId, blank, { x: selection.x, y: selection.y });
  return {
    document: pasteSelection(cleared, layerId, clipboard, destination),
    selection: { ...selection, x: destination.x, y: destination.y },
  };
}
