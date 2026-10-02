import { describe, expect, it } from 'vitest';
import {
  classifyTerrainTransition,
  getTerrainTransition,
  isTerrainTransitionRegistered,
} from './terrain-transition-registry';
import { terrainVariationHash, terrainVariationIndex } from './terrain-variation';

describe('terrain transition registry', () => {
  it('contains only currently verified semantic transitions', () => {
    expect(isTerrainTransitionRegistered('grass', 'water')).toBe(true);
    expect(isTerrainTransitionRegistered('grass', 'dirt')).toBe(true);
    expect(isTerrainTransitionRegistered('sand', 'grass')).toBe(false);
    expect(getTerrainTransition('grass', 'water')?.key).toBe('grass_to_water');
  });

  it('distinguishes same, registered, and unregistered pairs', () => {
    expect(classifyTerrainTransition('grass', 'grass')).toBe('same-terrain');
    expect(classifyTerrainTransition('grass', 'water')).toBe('registered');
    expect(classifyTerrainTransition('grass', 'sand')).toBe('unregistered');
  });
});

describe('terrain deterministic variation', () => {
  it('returns the same value for the same world and cell', () => {
    const first = terrainVariationHash('world-a', 12, 34, 'grass');
    const second = terrainVariationHash('world-a', 12, 34, 'grass');

    expect(second).toBe(first);
  });

  it('changes deterministically when the world seed or cell changes', () => {
    const base = terrainVariationHash('world-a', 12, 34, 'grass');

    expect(terrainVariationHash('world-b', 12, 34, 'grass')).not.toBe(base);
    expect(terrainVariationHash('world-a', 13, 34, 'grass')).not.toBe(base);
    expect(terrainVariationHash('world-a', 12, 34, 'sand')).not.toBe(base);
  });

  it('always produces an index inside the requested variant range', () => {
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        const index = terrainVariationIndex('world-a', x, y, 'grass', 4);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(4);
      }
    }
  });
});
