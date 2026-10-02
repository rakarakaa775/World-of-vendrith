import { describe, expect, it } from 'vitest';
import {
  sourceOfTalesCornerPattern,
  sourceOfTalesSandWaterTile,
} from './terrain-engine';

describe('Source of Tales terrain adapter', () => {
  it('maps every Vendrith mask to a supported or explicitly unsupported corner pattern', () => {
    for (let mask = 0; mask <= 255; mask += 1) {
      for (const centerTerrain of ['water', 'sand'] as const) {
        const pattern = sourceOfTalesCornerPattern(mask, centerTerrain);
        const isCenterHomogeneous =
          centerTerrain === 'water'
            ? pattern.every((value) => value === 0)
            : pattern.every((value) => value === 1);
        const isOppositeHomogeneous =
          centerTerrain === 'water'
            ? pattern.every((value) => value === 1)
            : pattern.every((value) => value === 0);

        if (isCenterHomogeneous) {
          expect(sourceOfTalesSandWaterTile(mask, centerTerrain)).toMatchObject({
            kind: 'base',
            terrain: centerTerrain,
            tileId: 10,
            pattern,
          });
        } else if (isOppositeHomogeneous) {
          expect(() => sourceOfTalesSandWaterTile(mask, centerTerrain)).toThrow(
            /Unsupported Source of Tales sand\/water corner pattern/,
          );
        } else {
          expect(() => sourceOfTalesSandWaterTile(mask, centerTerrain)).not.toThrow();
        }
      }
    }
  });

  it('uses the center terrain for the fully connected mask', () => {
    expect(sourceOfTalesCornerPattern(255, 'water')).toEqual([0, 0, 0, 0]);
    expect(sourceOfTalesCornerPattern(255, 'sand')).toEqual([1, 1, 1, 1]);
    expect(sourceOfTalesSandWaterTile(255, 'water')).toEqual({
      kind: 'base',
      terrain: 'water',
      tileId: 10,
      pattern: [0, 0, 0, 0],
    });
    expect(sourceOfTalesSandWaterTile(255, 'sand')).toEqual({
      kind: 'base',
      terrain: 'sand',
      tileId: 10,
      pattern: [1, 1, 1, 1],
    });
  });

  it('preserves the Source of Tales sand/water tile IDs for known patterns', () => {
    expect(() => sourceOfTalesSandWaterTile(0, 'sand')).toThrow(
      /Unsupported Source of Tales sand\/water corner pattern/,
    );
    expect(() => sourceOfTalesSandWaterTile(0, 'water')).toThrow(
      /Unsupported Source of Tales sand\/water corner pattern/,
    );
    expect(sourceOfTalesSandWaterTile(1, 'sand')).toEqual({
      kind: 'sandwater',
      tileId: 7,
      pattern: [1, 1, 0, 0],
    });
    expect(sourceOfTalesSandWaterTile(1, 'water')).toEqual({
      kind: 'sandwater',
      tileId: 13,
      pattern: [0, 0, 1, 1],
    });
  });
});
