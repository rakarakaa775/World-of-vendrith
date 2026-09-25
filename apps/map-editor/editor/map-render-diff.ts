import type { GridPoint } from "./grid";
import type { MapDocument } from "./map-document";
import { affectedTerrainCells } from "./terrain-engine";

export type MapRenderDiff = {
  dimensionsChanged: boolean;
  changedTerrainCells: GridPoint[];
  changedObjectIds: string[];
  objectLayerChanged: boolean;
};

const pointKey = (point: GridPoint) => point.x + ":" + point.y;

export function diffMapDocuments(previous: MapDocument | null, next: MapDocument): MapRenderDiff {
  if (!previous || previous.width !== next.width || previous.height !== next.height || previous.tileSize !== next.tileSize) {
    const all = Array.from({ length: next.width * next.height }, (_, index) => ({
      x: index % next.width,
      y: Math.floor(index / next.width),
    }));
    return {
      dimensionsChanged: true,
      changedTerrainCells: all,
      changedObjectIds: next.layers.find(layer => layer.kind === "objects")?.objects.map(object => object.id) ?? [],
      objectLayerChanged: true,
    };
  }

  const changedByLayer: GridPoint[] = [];
  for (const nextLayer of next.layers) {
    if (nextLayer.kind === "objects") continue;
    const previousLayer = previous.layers.find(layer => layer.id === nextLayer.id);
    if (!previousLayer) {
      for (let index = 0; index < nextLayer.cells.length; index++) {
        changedByLayer.push({ x: index % next.width, y: Math.floor(index / next.width) });
      }
      continue;
    }
    const length = Math.max(previousLayer.cells.length, nextLayer.cells.length);
    for (let index = 0; index < length; index++) {
      if (previousLayer.cells[index]?.tileId !== nextLayer.cells[index]?.tileId) {
        changedByLayer.push({ x: index % next.width, y: Math.floor(index / next.width) });
      }
    }
  }

  const previousObjects = new Map(
    (previous.layers.find(layer => layer.kind === "objects")?.objects ?? []).map(object => [object.id, object]),
  );
  const nextObjects = new Map(
    (next.layers.find(layer => layer.kind === "objects")?.objects ?? []).map(object => [object.id, object]),
  );
  const changedObjectIds = new Set<string>();
  for (const [id, object] of nextObjects) {
    const before = previousObjects.get(id);
    if (!before || JSON.stringify(before) !== JSON.stringify(object)) changedObjectIds.add(id);
  }
  for (const id of previousObjects.keys()) {
    if (!nextObjects.has(id)) changedObjectIds.add(id);
  }

  const objectLayerChanged =
    changedObjectIds.size > 0 ||
    (previous.layers.find(layer => layer.kind === "objects")?.visible ?? true) !==
      (next.layers.find(layer => layer.kind === "objects")?.visible ?? true);

  const uniqueChanged = [...new Map(changedByLayer.map(point => [pointKey(point), point])).values()];
  return {
    dimensionsChanged: false,
    changedTerrainCells: affectedTerrainCells(next, uniqueChanged),
    changedObjectIds: [...changedObjectIds],
    objectLayerChanged,
  };
}
