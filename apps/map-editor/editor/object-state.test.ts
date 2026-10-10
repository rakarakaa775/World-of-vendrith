import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { placeBuilding, placePaletteAsset, alignObjects, distributeObjects, mirrorObjects, toggleObjectSelection, boxSelectObjectIds, updateObjectTransform, updateObjectsTransform, selectObjectIdsByFilter, scaleObjects, duplicateObjects, moveObject, scatterPaletteAssets } from './object-state';

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

  it('translates and rotates a selected group atomically using the primary object as anchor', () => {
    const value = createStarterMap();
    const layer = value.layers.find(candidate => candidate.id === 'objects')!;
    const first = { id: 'group-a', kind: 'decoration' as const, category: 'nature', x: 1, y: 1, width: 1, height: 1, assetId: 'tree', rotation: 0, zIndex: 0, collision: false };
    const second = { ...first, id: 'group-b', x: 3, y: 1, rotation: 90 };
    const source = { ...value, layers: value.layers.map(candidate => candidate.id === layer.id ? { ...candidate, objects: [first, second] } : candidate) };
    const moved = updateObjectsTransform(source, layer.id, [first.id, second.id], first.id, { x: 2, y: 2, rotation: 90 });
    const objects = moved.layers.find(candidate => candidate.id === layer.id)!.objects;
    expect(objects.find(object => object.id === first.id)).toMatchObject({ x: 2, y: 2, rotation: 90 });
    expect(objects.find(object => object.id === second.id)).toMatchObject({ x: 4, y: 2, rotation: 180 });
    expect(updateObjectsTransform(source, layer.id, [first.id, second.id], first.id, { width: 2 })).toBe(source);
  });

  it('rejects non-finite single and group transform values without mutating the document', () => {
    const value = doc();
    const layer = value.layers.find(candidate => candidate.id === 'objects')!;
    const ids = layer.objects.slice(0, 2).map(object => object.id);
    expect(updateObjectTransform(value, layer.id, ids[0], { x: Number.NaN })).toBe(value);
    expect(updateObjectTransform(value, layer.id, ids[0], { width: Number.POSITIVE_INFINITY })).toBe(value);
    expect(updateObjectsTransform(value, layer.id, ids, ids[0], { y: Number.NaN })).toBe(value);
    expect(updateObjectsTransform(value, layer.id, ids, ids[0], { rotation: Number.NEGATIVE_INFINITY })).toBe(value);
  });

  it('rejects group transforms that collide or exceed map bounds', () => {
    const value = createStarterMap();
    const layer = value.layers.find(candidate => candidate.id === 'objects')!;
    const first = { id: 'group-a', kind: 'decoration' as const, category: 'nature', x: 1, y: 1, width: 1, height: 1, assetId: 'tree', rotation: 0, zIndex: 0, collision: false };
    const second = { ...first, id: 'group-b', x: 3, y: 1 };
    const blocker = { ...first, id: 'blocker', x: 6, y: 1 };
    const source = { ...value, layers: value.layers.map(candidate => candidate.id === layer.id ? { ...candidate, objects: [first, second, blocker] } : candidate) };
    expect(updateObjectsTransform(source, layer.id, [first.id, second.id], first.id, { x: 6 })).toBe(source);
    expect(updateObjectsTransform(source, layer.id, [first.id, second.id], first.id, { x: value.width })).toBe(source);
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
    const copy = next.objects.find(o=>!ids.includes(o.id))!;
    expect(copy.x).toBe(layer.objects[0].x + layer.objects[0].width + 1);
    expect(copy.y).toBe(layer.objects[0].y);
    expect(copy.id).toContain("duplicate-objects-");
    expect(next.objects.filter(o => o.id === copy.id)).toHaveLength(1);
  });

  it('rejects duplication when the translated group would overlap an existing object or leave map bounds', () => {
    const value = doc();
    const layer = value.layers.find(l => l.id === 'objects')!;
    const selected = layer.objects[0];
    const blocker = { ...layer.objects[1], x: selected.x + selected.width + 1, y: selected.y };
    const blocked = { ...value, layers: value.layers.map(l => l.id === 'objects' ? { ...l, objects: l.objects.map(o => o.id === layer.objects[1].id ? blocker : o) } : l) };
    expect(duplicateObjects(blocked, 'objects', [selected.id])).toBe(blocked);
    expect(duplicateObjects(value, 'missing-layer', [selected.id])).toBe(value);
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
      assetName: 'Tree',
      x: 2,
      y: 2,
      collision: false,
    });
  });

  it('creates stable IDs for the same asset and target cell', () => {
    const document = createStarterMap();
    const asset = { id: 'forest/tree-01', label: 'Tree', family: 'playable-nature' };
    const first = placePaletteAsset(document, 'objects', { x: 7, y: 9 }, asset);
    const second = placePaletteAsset(document, 'objects', { x: 7, y: 9 }, asset);
    expect(first).toEqual(second);
    expect(first.layers.find(layer => layer.id === 'objects')?.objects.at(-1)?.id)
      .toBe('asset-objects-forest_tree-01-7-9');
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
    expect(next.layers.find(layer => layer.id === 'objects')?.objects.at(-1)?.assetName)
      .toBe('Approved Tree');
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


describe('deterministic collision-aware asset scatter', () => {
  const asset = { id: 'forest-tree', label: 'Forest Tree', family: 'playable-nature' };

  it('returns identical placements for the same seed and input document', () => {
    const document = createStarterMap();
    const first = scatterPaletteAssets(document, 'objects', asset, { count: 12, seed: 'forest-42' });
    const second = scatterPaletteAssets(document, 'objects', asset, { count: 12, seed: 'forest-42' });
    expect(first).toEqual(second);
    expect(first.layers.find(layer => layer.id === 'objects')?.objects).toHaveLength(
      (document.layers.find(layer => layer.id === 'objects')?.objects.length ?? 0) + 12,
    );
  });

  it('keeps IDs unique when the same scatter seed is applied repeatedly', () => {
    const document = createStarterMap();
    const first = scatterPaletteAssets(document, 'objects', asset, { count: 8, seed: 'repeat-me' });
    const second = scatterPaletteAssets(first, 'objects', asset, { count: 8, seed: 'repeat-me' });
    const objects = second.layers.find(layer => layer.id === 'objects')!.objects;
    const ids = objects.map(object => object.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(objects.filter(object => object.id.startsWith('scatter-objects-repeat-me-'))).toHaveLength(16);
  });

  it('does not overlap existing footprints or scatter cells', () => {
    let document = createStarterMap();
    document = placeBuilding(document, 'objects', { x: 3, y: 3 }, {
      id: 'warehouse', label: 'Warehouse', category: 'warehouse', footprint: '3x3',
      assetId: 'warehouse', width: 3, height: 3, collision: true,
    });
    const scattered = scatterPaletteAssets(document, 'objects', asset, {
      count: 20, seed: 8, minDistance: 2,
    });
    const objects = scattered.layers.find(layer => layer.id === 'objects')!.objects;
    const additions = objects.filter(object => object.id.startsWith('scatter-'));
    expect(additions.length).toBeGreaterThan(0);
    expect(additions.every(object => object.x >= 0 && object.y >= 0 && object.x < document.width && object.y < document.height)).toBe(true);
    for (let i = 0; i < additions.length; i += 1) {
      expect(additions[i].x >= 3 && additions[i].x < 6 && additions[i].y >= 3 && additions[i].y < 6).toBe(false);
      for (let j = i + 1; j < additions.length; j += 1) {
        expect(Math.abs(additions[i].x - additions[j].x) + Math.abs(additions[i].y - additions[j].y)).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('fails closed for invalid counts and locked layers', () => {
    const document = createStarterMap();
    expect(scatterPaletteAssets(document, 'objects', asset, { count: 0, seed: 1 })).toBe(document);
    const locked = {
      ...document,
      layers: document.layers.map(layer => layer.id === 'objects' ? { ...layer, locked: true } : layer),
    };
    expect(scatterPaletteAssets(locked, 'objects', asset, { count: 4, seed: 1 })).toBe(locked);
  });
});
