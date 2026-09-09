import { MapDocument, TileCell } from './map-document';
import { indexFor, isInsideGrid, GridPoint } from './grid';

export function paintCell(document: MapDocument, layerId: string, point: GridPoint, tileId: string | null): MapDocument {
  if (!isInsideGrid(point, document.width, document.height)) return document;
  const layer = document.layers.find((item) => item.id === layerId);
  if (!layer) return document;

  const cells = [...layer.cells];
  const index = indexFor(point, document.width);
  while (cells.length < document.width * document.height) cells.push({ tileId: null });
  const nextCell: TileCell = { tileId };
  cells[index] = nextCell;

  return {
    ...document,
    layers: document.layers.map((item) => item.id === layerId ? { ...item, cells } : item),
  };
}
