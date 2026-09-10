import type { TerrainKey } from './terrain-engine';
import { getTerrainAssetBinding, type TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainMaskPreviewCell = {
  mask: number;
  variantKey: string;
  bound: boolean;
};

export function terrainMaskPreviewCells(
  terrain: TerrainKey,
  bindings: TerrainAssetBindingMap = {},
): TerrainMaskPreviewCell[] {
  return Array.from({ length: 256 }, (_, mask) => ({
    mask,
    variantKey: `mask_${mask.toString(16).padStart(2, '0')}`,
    bound: getTerrainAssetBinding(bindings, terrain, mask) !== null,
  }));
}
