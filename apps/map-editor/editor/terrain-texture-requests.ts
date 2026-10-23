import type { MapDocument, MapLayer } from './map-document';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import { getTerrainAssetBinding } from './terrain-asset-binding';
import { terrainFromTileId } from './terrain-engine';
import { resolveTerrainRenderCell } from './terrain-resolver';

/** Collect approved texture IDs for every layer that the renderer will draw. */
export function collectTerrainBindingAssetIds(
  document: MapDocument,
  bindings: TerrainAssetBindingMap,
  isRenderableLayer: (layer: MapLayer) => boolean,
): Set<string> {
  const assetIds = new Set<string>();

  for (const layer of document.layers) {
    if (layer.kind !== 'ground' || !isRenderableLayer(layer)) continue;

    for (let index = 0; index < document.width * document.height; index += 1) {
      const tileId = layer.cells[index]?.tileId;
      const terrain = terrainFromTileId(tileId ?? null);
      if (!terrain) continue;

      const resolved = resolveTerrainRenderCell(
        document,
        layer.id,
        { x: index % document.width, y: Math.floor(index / document.width) },
        bindings,
      );
      const binding = resolved?.assetId
        ? getTerrainAssetBinding(bindings, terrain, resolved.mask)
        : null;
      if (binding) assetIds.add(binding.assetId);
    }
  }

  return assetIds;
}
