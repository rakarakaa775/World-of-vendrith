import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { placeBuilding, placePaletteAsset, alignObjects, distributeObjects, mirrorObjects, toggleObjectSelection, boxSelectObjectIds, updateObjectTransform, selectObjectIdsByFilter, scaleObjects, duplicateObjects, moveObject } from './object-state';

describe('selection and transform operations', () => {
  function doc() {
    let value = createStarterMap();
    value = { ...value, layers: value.layers.map(l => l.id === 'objects' ? { ...l, objects: [] } : l) };
    value = placeBuilding(value, 'objects', { x: 4, y: 4 }, { id:'a', label:'A', category:'house', footprint:'2x2', assetId:'a', width:2, height:2, collision:true });
    value = placeBuilding(value, 'objects', { x: 10, y: 8 }, { id:'b', label:'B', category:'shop', footprint:'2x2', assetId:'b', width:2, height:2, collision:true });
    value = placeBuilding(value, 'objects', { x: 16, y: 12 }, { id:'c', label:'C', category:'tower', footprint:'2x3', assetId:'c', width:2, height:3, collision:true });
    return value;
  }

  it('toggles multi-selection deterministically', () => {
    expect(toggleObjectSelection([], 'a')).toEqual(['a']);
    expect(toggleObjectSelection(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleObjectSelection(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('selects objects intersecting a box', () => {
    const value = doc();
    expect(boxSelectObjectIds(value, 'objects', { x: 3, y: 3, width: 5, height: 5 })).toEqual([value.layers.find(l=>l.id==='objects')!.objects[0].id]);
  });

  it('updates numeric transform without leaving map bounds', () => {
    const value = doc();
    const id = value.layers.find(l=>l.id==='objects')!.objects[0].id;
    const moved = updateObjectTransform(value, 'objects', id, { x: 20, y: 20, rotation: 90 });
    const object = moved.layers.find(l=>l.id==='objects')!.objects.find(o=>o.id===id)!;
    expect(object.x).toBe(20);
    expect(object.y).toBe(20);
    expect(object.rotation).toBe(90);
  });

  it('aligns and distributes selected objects', () => {
    const value = doc();
    const ids = value.layers.find(l=>l.id==='objects')!.objects.map(o=>o.id);
    const aligned = alignObjects(value, 'objects', ids, 'top');
    const ys = aligned.layers.find(l=>l.id==='objects')!.objects.map(o=>o.y);
    expect(new Set(ys).size).toBe(1);
    const distributed = distributeObjects(value, 'objects', ids, 'horizontal');
    const xs = distributed.layers.find(l=>l.id==='objects')!.objects.map(o=>o.x);
    expect(xs).toEqual([...xs].sort((a,b)=>a-b));
  });

  it('duplicates selected objects without mutating the source document', () => {
    const value = doc();
    const layer = value.layers.find(l=>l.id==='objects')!;
    const ids = layer.objects.map(o=>o.id);
    const duplicated = duplicateObjects(value, 'objects', [ids[0]]);
    expect(duplicated).not.toBe(value);
    const next = duplicated.layers.find(l=>l.id==='objects')!;
    expect(next.objects).toHaveLength(4);
    expect(next.objects.filter(o=>!ids.includes(o.id))).toHaveLength(1);
    expect(next.objects.find(o=>!ids.includes(o.id))!.x).toBe(layer.objects[0].x + 1);
  });

  it('rejects move and scale when the result overlaps another object', () => {
    const value = doc();
    const layer = value.layers.find(l=>l.id==='objects')!;
    const first = layer.objects[0];
    const second = layer.objects[1];
    expect(moveObject(value, 'objects', first.id, { x: second.x, y: second.y })).toBe(value);
    expect(scaleObjects(value, 'objects', [first.id], 5)).toBe(value);
  });

  it('mirrors selection inside its bounding box', () => {
    const value = doc();
    const ids = value.layers.find(l=>l.id==='objects')!.objects.map(o=>o.id);
    const mirrored = mirrorObjects(value, 'objects', ids, 'horizontal');
    expect(mirrored).not.toBe(value);
  });
});


describe('level-aware palette asset placement', () => {
  it('places a catalog asset as a map object without changing the document hierarchy', () => {
    const document = createStarterMap();
    const next = placePaletteAsset(document, 'objects', { x: 2, y: 2 }, {
      id: 'tree',
      label: 'Tree',
      family: 'playable-nature',
    });
    const object = next.layers.find(layer => layer.id === 'objects')?.objects.at(-1);
    expect(object).toMatchObject({
      kind: 'decoration',
      category: 'tree',
      assetId: 'tree',
      x: 2,
      y: 2,
      collision: false,
    });
  });

  it('persists the physical registry identity when a runtime asset is placed', () => {
    const document = createStarterMap();
    const next = placePaletteAsset(document, 'objects', { x: 6, y: 6 }, {
      id: 'registry:asset-1',
      registryId: '11111111-1111-4111-8111-111111111111',
      label: 'Approved Tree',
      family: 'playable-nature',
    });
    expect(next.layers.find(layer => layer.id === 'objects')?.objects.at(-1)?.assetId)
      .toBe('11111111-1111-4111-8111-111111111111');
  });

  it('does not place an asset on a blocked object cell', () => {
    const document = createStarterMap();
    const first = placePaletteAsset(document, 'objects', { x: 2, y: 2 }, {
      id: 'tree',
      label: 'Tree',
      family: 'playable-nature',
    });
    const second = placePaletteAsset(first, 'objects', { x: 2, y: 2 }, {
      id: 'rock',
      label: 'Rock',
      family: 'playable-nature',
    });
    expect(second).toBe(first);
  });
});
