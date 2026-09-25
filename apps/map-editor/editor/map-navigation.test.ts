import { describe, expect, it } from 'vitest';
import { createMap, type MapDocument, type MapObject } from './map-document';
import { canOpenChildMap, canOpenObjectTarget, getNavigationPath, getParentMapId } from './map-navigation';

const objectLayer = (document: MapDocument) => document.layers.find(layer => layer.kind === 'objects')!;

describe('map hierarchy navigation', () => {
  it('models World → Region → Playable → Interior parents', () => {
    const world = { ...createMap('world'), id: 'world-1' };
    const region = { ...createMap('region', world.id), id: 'region-1' };
    const playable = { ...createMap('playable', region.id, 'exterior'), id: 'playable-1' };
    const interior = { ...createMap('playable', region.id, 'interior', playable.id), id: 'interior-1' };

    expect(getParentMapId(world)).toBeNull();
    expect(getParentMapId(region)).toBe(world.id);
    expect(getParentMapId(playable)).toBe(region.id);
    expect(getParentMapId(interior)).toBe(playable.id);
  });

  it('allows only the intended drill-down transitions', () => {
    const world = { ...createMap('world'), id: 'world-1' };
    const region = { ...createMap('region', world.id), id: 'region-1' };
    const playable = { ...createMap('playable', region.id, 'exterior'), id: 'playable-1' };
    const interior = { ...createMap('playable', null, 'interior', playable.id), id: 'interior-1' };

    expect(canOpenChildMap(world, region)).toBe(true);
    expect(canOpenChildMap(region, playable)).toBe(true);
    expect(canOpenChildMap(playable, interior)).toBe(true);
    expect(canOpenChildMap(world, playable)).toBe(false);
    expect(canOpenChildMap(region, interior)).toBe(false);
    expect(canOpenChildMap(interior, playable)).toBe(false);
  });

  it('opens a Region settlement object into its linked Playable map', () => {
    const region = { ...createMap('region', 'world-1'), id: 'region-1' };
    const playable = { ...createMap('playable', region.id, 'exterior'), id: 'village-1' };
    const settlement: MapObject = {
      id: 'village-object',
      kind: 'poi',
      category: 'village',
      x: 10, y: 10, width: 4, height: 4,
      assetId: 'settlement-village',
      rotation: 0, zIndex: 1, collision: false,
      childMapId: playable.id,
    };
    objectLayer(region).objects.push(settlement);

    expect(canOpenObjectTarget(region, settlement, playable)).toBe(true);
  });

  it('opens a Playable building into its linked Interior map', () => {
    const playable = { ...createMap('playable', 'region-1', 'exterior'), id: 'village-1' };
    const interior = { ...createMap('playable', null, 'interior', playable.id), id: 'house-1' };
    const house: MapObject = {
      id: 'house-object',
      kind: 'building',
      category: 'house',
      x: 5, y: 5, width: 2, height: 2,
      assetId: 'house-basic',
      rotation: 0, zIndex: 2, collision: true,
      interiorMapId: interior.id,
    };
    objectLayer(playable).objects.push(house);

    expect(canOpenObjectTarget(playable, house, interior)).toBe(true);
  });

  it('rejects a stale or cross-hierarchy object target', () => {
    const region = { ...createMap('region', 'world-1'), id: 'region-1' };
    const playable = { ...createMap('playable', 'other-region', 'exterior'), id: 'village-1' };
    const settlement: MapObject = {
      id: 'village-object',
      kind: 'poi',
      category: 'village',
      x: 0, y: 0, width: 2, height: 2,
      assetId: 'village',
      rotation: 0, zIndex: 0, collision: false,
      childMapId: playable.id,
    };
    objectLayer(region).objects.push(settlement);

    expect(canOpenObjectTarget(region, settlement, playable)).toBe(false);
  });

  it('builds a breadcrumb path and detects hierarchy corruption', () => {
    const world = { ...createMap('world'), id: 'world-1' };
    const region = { ...createMap('region', world.id), id: 'region-1' };
    const playable = { ...createMap('playable', region.id, 'exterior'), id: 'playable-1' };
    const interior = { ...createMap('playable', null, 'interior', playable.id), id: 'interior-1' };
    const docs = new Map([world, region, playable, interior]);

    expect(getNavigationPath(interior, docs).map(document => document.id))
      .toEqual(['world-1', 'region-1', 'playable-1', 'interior-1']);

    const broken = { ...interior, parentPlayableMapId: 'missing-map' };
    expect(() => getNavigationPath(broken, docs)).toThrow('Missing parent map: missing-map');

    const cyclic = { ...region, parentMapId: region.id };
    const cyclicDocs = new Map([world, cyclic, playable, interior]);
    expect(() => getNavigationPath(interior, cyclicDocs)).toThrow('Map hierarchy contains a cycle');
  });
});
