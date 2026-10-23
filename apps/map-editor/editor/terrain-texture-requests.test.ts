import { describe, expect, it } from 'vitest';
import { createMap, type MapLayer } from './map-document';
import { createTerrainAssetBindingMap } from './terrain-asset-binding';
import { collectTerrainBindingAssetIds } from './terrain-texture-requests';

const binding = (mask: number, assetId: string) => ({
  terrain: 'grass' as const,
  mask,
  assetId,
  sourceRuleKey: null,
  region: { x: 0, y: 0, width: 16, height: 16 },
});

function makeLayer(id: string, kind: MapLayer['kind'], tileIds: string[]): MapLayer {
  return {
    id,
    name: id,
    kind,
    visible: true,
    locked: false,
    active: id === 'ground-active',
    opacity: 1,
    cells: tileIds.map(tileId => ({ tileId })),
    objects: [],
  };
}

describe('terrain texture request collection', () => {
  it('requests mask-specific bindings used by visible non-active ground layers', () => {
    const base = createMap('playable');
    const water = Array.from({ length: 9 }, () => 'deepwater');
    const grass = [...water];
    grass[4] = 'grass';
    grass[1] = 'grass';
    grass[5] = 'grass';
    const active = makeLayer('ground-active', 'ground', water);
    const nonActive = makeLayer('ground-detail', 'ground', grass);
    const document = {
      ...base,
      width: 3,
      height: 3,
      layers: [active, nonActive, makeLayer('objects', 'objects', water)],
    };
    const bindings = createTerrainAssetBindingMap([
      binding(255, 'grass-base'),
      binding(3, 'grass-mask-3'),
    ]);

    const requested = collectTerrainBindingAssetIds(document, bindings, layer => layer.visible);

    expect(requested).toContain('grass-mask-3');
  });

  it('does not request bindings from hidden, object, or collision layers', () => {
    const base = createMap('playable');
    const tileIds = Array.from({ length: 9 }, () => 'grass');
    const visible = makeLayer('ground-visible', 'ground', tileIds);
    const hidden = { ...makeLayer('ground-hidden', 'ground', tileIds), visible: false };
    const objects = makeLayer('objects', 'objects', tileIds);
    const collision = makeLayer('collision', 'collision', tileIds);
    const document = { ...base, width: 3, height: 3, layers: [visible, hidden, objects, collision] };
    const bindings = createTerrainAssetBindingMap([binding(255, 'grass-base')]);

    const requested = collectTerrainBindingAssetIds(document, bindings, layer => layer.visible);

    expect(requested).toEqual(new Set(['grass-base']));
  });
});
