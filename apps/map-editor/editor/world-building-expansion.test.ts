import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { planWorldExpansion } from './world-building-expansion';

describe('world building expansion plan', () => {
  it('plans exactly four regions and sixteen playable maps with stable IDs', () => {
    const world = { ...createMap('world'), id: 'world-main', width: 128, height: 128 };
    const plan = planWorldExpansion(world);
    expect(plan.regions).toHaveLength(4);
    expect(plan.regions.flatMap(group => group.playables)).toHaveLength(16);
    expect(plan.regions.every(group => group.region.parentMapId === world.id)).toBe(true);
    expect(plan.regions.every(group => group.playables.every(map => map.parentMapId === group.region.id))).toBe(true);
    expect(planWorldExpansion(world)).toEqual(plan);
  });

  it('partitions uneven dimensions without gaps or overlap', () => {
    const world = { ...createMap('world'), id: 'uneven', width: 9, height: 7 };
    const plan = planWorldExpansion(world);
    const regions = plan.regions.map(group => group.region.parentBounds);
    expect(regions.reduce((sum, bounds) => sum + bounds.width * bounds.height, 0)).toBe(63);
    expect(regions.every(bounds => bounds.width > 0 && bounds.height > 0)).toBe(true);
    const playableBounds = plan.regions.flatMap(group => group.playables.map(map => map.parentBounds));
    expect(playableBounds.reduce((sum, bounds) => sum + bounds.width * bounds.height, 0)).toBe(63);
  });

  it('rejects non-world documents and dimensions too small to split', () => {
    expect(() => planWorldExpansion(createMap('region'))).toThrow('WORLD_EXPANSION_REQUIRES_WORLD');
    expect(() => planWorldExpansion({ ...createMap('world'), width: 1 })).toThrow('WORLD_EXPANSION_INVALID_WORLD');
  });
});
