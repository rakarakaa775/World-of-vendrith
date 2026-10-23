import { describe, expect, it } from 'vitest';
import { isTerrainAssetRegionWithinBounds } from './terrain-asset-region';

describe('terrain asset region bounds', () => {
  it('accepts a crop fully inside the loaded source dimensions', () => {
    expect(isTerrainAssetRegionWithinBounds({ x: 144, y: 176, width: 16, height: 16 }, 160, 192)).toBe(true);
  });

  it.each([
    ['x past the source width', { x: 145, y: 0, width: 16, height: 16 }],
    ['y past the source height', { x: 0, y: 177, width: 16, height: 16 }],
    ['width extending beyond the source', { x: 150, y: 0, width: 16, height: 16 }],
    ['height extending beyond the source', { x: 0, y: 180, width: 16, height: 16 }],
    ['fractional coordinates', { x: 0.5, y: 0, width: 16, height: 16 }],
    ['zero width', { x: 0, y: 0, width: 0, height: 16 }],
  ])('rejects %s', (_label, region) => {
    expect(isTerrainAssetRegionWithinBounds(region, 160, 192)).toBe(false);
  });

  it('rejects unknown or invalid source dimensions', () => {
    expect(isTerrainAssetRegionWithinBounds(null, 160, 192)).toBe(false);
    expect(isTerrainAssetRegionWithinBounds({ x: 0, y: 0, width: 16, height: 16 }, 0, 192)).toBe(false);
  });
});
