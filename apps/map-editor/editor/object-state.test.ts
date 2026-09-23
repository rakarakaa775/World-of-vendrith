import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { placeBuilding, alignObjects, distributeObjects, mirrorObjects, toggleObjectSelection, boxSelectObjectIds, updateObjectTransform, selectObjectIdsByFilter, scaleObjects } from './object-state';

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

  it('mirrors selection inside its bounding box', () => {
    const value = doc();
    const ids = value.layers.find(l=>l.id==='objects')!.objects.map(o=>o.id);
    const mirrored = mirrorObjects(value, 'objects', ids, 'horizontal');
    expect(mirrored).not.toBe(value);
  });
});
