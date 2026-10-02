import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { buildMapTree, getMapPath } from './map-manager';
import { canOpenChildMap, linkBuildingToInterior, linkRegionObjectToPlayable } from './map-navigation';

describe('map hierarchy completion', () => {
  it('nests interiors beneath their exterior playable map in the tree and path', () => {
    const world = createMap('world');
    const region = createMap('region', world.id);
    const exterior = createMap('playable', region.id, 'exterior');
    const interior = createMap('playable', region.id, 'interior', exterior.id);

    const tree = buildMapTree([world, region, exterior, interior]);
    expect(tree[0].children[0].children[0].id).toBe(exterior.id);
    expect(tree[0].children[0].children[0].children[0].id).toBe(interior.id);
    expect(getMapPath(interior, [world, region, exterior, interior]).map(map => map.id))
      .toEqual([world.id, region.id, exterior.id, interior.id]);
  });

  it('links a region POI only to a playable exterior child', () => {
    const world = createMap('world');
    const region = createMap('region', world.id);
    const playable = createMap('playable', region.id, 'exterior');
    const poi = { id: 'village-poi', kind: 'poi' as const, category: 'village', x: 1, y: 1, width: 1, height: 1, assetId: 'village', rotation: 0, zIndex: 0, collision: false };
    const withPoi = { ...region, layers: region.layers.map(layer => layer.id === 'objects' ? { ...layer, objects: [poi] } : layer) };

    const linked = linkRegionObjectToPlayable(withPoi, poi.id, playable);
    expect(linked.layers.find(layer => layer.id === 'objects')?.objects[0]?.childMapId).toBe(playable.id);
    expect(canOpenChildMap(linked, playable)).toBe(true);
  });

  it('links a building only to an interior owned by that exterior', () => {
    const world = createMap('world');
    const region = createMap('region', world.id);
    const exterior = createMap('playable', region.id, 'exterior');
    const interior = createMap('playable', region.id, 'interior', exterior.id);
    const building = { id: 'house-1', kind: 'building' as const, category: 'house', x: 2, y: 2, width: 2, height: 2, assetId: 'house', rotation: 0, zIndex: 0, collision: true };
    const withBuilding = { ...exterior, layers: exterior.layers.map(layer => layer.id === 'objects' ? { ...layer, objects: [building] } : layer) };

    const linked = linkBuildingToInterior(withBuilding, building.id, interior);
    expect(linked.layers.find(layer => layer.id === 'objects')?.objects[0]?.interiorMapId).toBe(interior.id);
  });

  it('rejects stale hierarchy targets instead of creating an invalid link', () => {
    const world = createMap('world');
    const region = createMap('region', world.id);
    const otherRegion = createMap('region', world.id);
    const playable = createMap('playable', otherRegion.id, 'exterior');
    const poi = { id: 'town-poi', kind: 'poi' as const, category: 'town', x: 0, y: 0, width: 1, height: 1, assetId: 'town', rotation: 0, zIndex: 0, collision: false };
    const withPoi = { ...region, layers: region.layers.map(layer => layer.id === 'objects' ? { ...layer, objects: [poi] } : layer) };

    expect(() => linkRegionObjectToPlayable(withPoi, poi.id, playable)).toThrow('Invalid playable child target');
  });
});
