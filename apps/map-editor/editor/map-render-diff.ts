import type { GridPoint } from "./grid";
import type { MapDocument } from "./map-document";
import { affectedTerrainCells } from "./terrain-engine";

export type MapRenderLayerDiff = {
  layerId: string;
  changedCells: GridPoint[];
};

export type MapRenderDiff = {
  dimensionsChanged: boolean;
  changedTerrainByLayer: MapRenderLayerDiff[];
  changedObjectIds: string[];
  objectLayerChanged: boolean;
};

const pointKey = (point: GridPoint) => point.x + ":" + point.y;

const allCells = (width: number, height: number): GridPoint[] =>
  Array.from({ length: width * height }, (_, index) => ({
    x: index % width,
    y: Math.floor(index / width),
  }));

export function diffMapDocuments(previous: MapDocument | null, next: MapDocument): MapRenderDiff {
  if (
    !previous ||
    previous.width !== next.width ||
    previous.height !== next.height ||
    previous.tileSize !== next.tileSize
  ) {
    return {
      dimensionsChanged: true,
      changedTerrainByLayer: next.layers
        .filter(layer => layer.kind !== "objects")
        .map(layer => ({ layerId: layer.id, changedCells: allCells(next.width, next.height) })),
      changedObjectIds:
        next.layers.find(layer => layer.kind === "objects")?.objects.map(object => object.id) ?? [],
      objectLayerChanged: true,
    };
  }

  const changedTerrainByLayer: MapRenderLayerDiff[] = [];

  for (const nextLayer of next.layers) {
    if (nextLayer.kind === "objects") continue;

    const previousLayer = previous.layers.find(layer => layer.id === nextLayer.id);
    const changedCells: GridPoint[] = [];

    if (!previousLayer || previousLayer.kind === "objects") {
      changedCells.push(...allCells(next.width, next.height));
    } else {
      const length = Math.max(previousLayer.cells.length, nextLayer.cells.length);
      for (let index = 0; index < length; index++) {
        if (previousLayer.cells[index]?.tileId !== nextLayer.cells[index]?.tileId) {
          changedCells.push({
            x: index % next.width,
            y: Math.floor(index / next.width),
          });
        }
      }
    }

    if (changedCells.length > 0) {
      const uniqueChanged = [...new Map(changedCells.map(point => [pointKey(point), point])).values()];
      changedTerrainByLayer.push({
        layerId: nextLayer.id,
        changedCells: affectedTerrainCells(next, uniqueChanged),
      });
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

  const previousObjectLayer = previous.layers.find(layer => layer.kind === "objects");
  const nextObjectLayer = next.layers.find(layer => layer.kind === "objects");
  const objectLayerChanged =
    changedObjectIds.size > 0 ||
    (previousObjectLayer?.visible ?? true) !== (nextObjectLayer?.visible ?? true);

  return {
    dimensionsChanged: false,
    changedTerrainByLayer,
    changedObjectIds: [...changedObjectIds],
    objectLayerChanged,
  };
}
