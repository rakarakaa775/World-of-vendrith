export type TerrainAssetRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Validate a sprite crop against the dimensions of its loaded source image. */
export function isTerrainAssetRegionWithinBounds(
  region: unknown,
  textureWidth: number,
  textureHeight: number,
): region is TerrainAssetRegion {
  if (!region || typeof region !== 'object') return false;
  const value = region as Record<string, unknown>;
  const { x, y, width, height } = value;
  if (
    ![x, y, width, height].every(
      item => typeof item === 'number' && Number.isInteger(item) && item >= 0,
    ) ||
    (width as number) <= 0 ||
    (height as number) <= 0 ||
    !Number.isFinite(textureWidth) ||
    !Number.isFinite(textureHeight) ||
    textureWidth <= 0 ||
    textureHeight <= 0
  ) {
    return false;
  }
  return (x as number) + (width as number) <= textureWidth &&
    (y as number) + (height as number) <= textureHeight;
}
