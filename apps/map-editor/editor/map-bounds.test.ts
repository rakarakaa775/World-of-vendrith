import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { clampParentBounds, isValidParentBounds, setRegionParentBounds } from './map-bounds';

describe('region parent bounds', () => {
  it('accepts bounds that fit inside the parent world or region', () => {
    const world = createMap('world', null, 'exterior', null, 128, 128);
    const region = createMap('region', world.id);
    const bounds = { x: 16, y: 20, width: 64, height: 48 };
    expect(isValidParentBounds(bounds, world)).toBe(true);
    expect(setRegionParentBounds(region, world, bounds).parentBounds).toEqual(bounds);
  });

  it('rejects bounds outside the parent map', () => {
    const world = createMap('world', null, 'exterior', null, 64, 64);
    expect(isValidParentBounds({ x: 32, y: 32, width: 40, height: 16 }, world)).toBe(false);
  });

  it('clamps editor input into a valid parent rectangle', () => {
    const world = createMap('world', null, 'exterior', null, 64, 32);
    expect(clampParentBounds({ x: -4, y: 20, width: 100, height: 20 }, world))
      .toEqual({ x: 0, y: 12, width: 64, height: 20 });
  });
});
