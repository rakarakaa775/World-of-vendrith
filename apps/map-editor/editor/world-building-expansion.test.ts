import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { materializeChildMap, materializeWorldExpansion, planWorldExpansion } from './world-building-expansion';

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

  it('partitions source bounds without gaps and scales each child grid 2x per dimension', () => {
    const world = { ...createMap('world'), id: 'uneven', width: 9, height: 7 };
    const plan = planWorldExpansion(world);
    const regions = plan.regions.map(group => group.region.parentBounds);
    expect(regions.reduce((sum, bounds) => sum + bounds.width * bounds.height, 0)).toBe(63);
    expect(regions.every(bounds => bounds.width > 0 && bounds.height > 0)).toBe(true);
    const playableBounds = plan.regions.flatMap(group => group.playables.map(map => map.parentBounds));
    expect(playableBounds.reduce((sum, bounds) => sum + bounds.width * bounds.height, 0)).toBe(252);
    for (const group of plan.regions) {
      expect(group.region.width).toBe(group.region.parentBounds.width * 2);
      expect(group.region.height).toBe(group.region.parentBounds.height * 2);
      for (const playable of group.playables) {
        expect(playable.width).toBe(playable.parentBounds.width * 2);
        expect(playable.height).toBe(playable.parentBounds.height * 2);
      }
    }
  });

  it('rejects non-world documents and dimensions too small to split', () => {
    expect(() => planWorldExpansion(createMap('region'))).toThrow('WORLD_EXPANSION_REQUIRES_WORLD');
    expect(() => planWorldExpansion({ ...createMap('world'), width: 1 })).toThrow('WORLD_EXPANSION_INVALID_WORLD');
  });
});


describe('materialize world expansion', () => {
  it('creates 4 Region and 16 Playable documents with parent links and doubled grids', () => {
    const world = createMap('world', null, 'exterior', null, 8, 8);
    const maps = materializeWorldExpansion(world);
    expect(maps).toHaveLength(20);
    const regions = maps.filter(map => map.mapType === 'region');
    const playables = maps.filter(map => map.mapType === 'playable');
    expect(regions).toHaveLength(4);
    expect(playables).toHaveLength(16);
    expect(regions.map(map => map.name)).toEqual(['Region A', 'Region B', 'Region C', 'Region D']);
    for (const region of regions) {
      expect(region.parentMapId).toBe(world.id);
      expect(region.width).toBe(8);
      expect(region.height).toBe(8);
      expect(playables.filter(map => map.parentMapId === region.id)).toHaveLength(4);
    }
    for (const playable of playables) {
      expect(playable.width).toBe(8);
      expect(playable.height).toBe(8);
      expect(playable.layers.find(layer => layer.kind === 'ground')?.cells).toHaveLength(64);
    }
  });

  it('copies parent terrain into a 2x2 child-cell block', () => {
    const world = createMap('world', null, 'exterior', null, 4, 4);
    const ground = world.layers.find(layer => layer.kind === 'ground')!;
    ground.cells = ground.cells.map((_, index) => ({ tileId: `tile-${index}` }));
    const seed = planWorldExpansion(world).regions[0].region;
    const region = materializeChildMap(world, seed);
    const cells = region.layers.find(layer => layer.kind === 'ground')!.cells;
    expect([cells[0].tileId, cells[1].tileId, cells[region.width].tileId, cells[region.width + 1].tileId]).toEqual(['tile-0', 'tile-0', 'tile-0', 'tile-0']);
    expect(cells[2].tileId).toBe('tile-1');
  });
});
