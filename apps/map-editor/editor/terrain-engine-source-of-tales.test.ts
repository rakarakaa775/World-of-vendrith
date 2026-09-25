import { describe, expect, it } from 'vitest';
import {
  sourceOfTalesCornerPattern,
  sourceOfTalesSandWaterTile,
} from './terrain-engine';

describe('Source of Tales terrain adapter', () => {
  it('maps all 256 Vendrith masks to a valid sand/water tile reference', () => {
    for (let mask = 0; mask <= 255; mask += 1) {
      expect(() => sourceOfTalesSandWaterTile(mask, 'water')).not.toThrow();
      expect(() => sourceOfTalesSandWaterTile(mask, 'sand')).not.toThrow();
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
    expect(sourceOfTalesSandWaterTile(0, 'sand')).toEqual({
      kind: 'sandwater',
      tileId: 10,
      pattern: [0, 0, 0, 0],
    });
    expect(sourceOfTalesSandWaterTile(0, 'water')).toEqual({
      kind: 'sandwater',
      tileId: 10,
      pattern: [1, 1, 1, 1],
    });
    expect(sourceOfTalesSandWaterTile(1, 'sand')).toEqual({
      kind: 'sandwater',
      tileId: 5,
      pattern: [1, 0, 0, 0],
    });
    expect(sourceOfTalesSandWaterTile(1, 'water')).toEqual({
      kind: 'sandwater',
      tileId: 14,
      pattern: [0, 1, 1, 1],
    });
  });
});
