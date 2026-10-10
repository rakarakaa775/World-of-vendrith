import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { validateMapDocument } from './map-validation';

describe('map validation readiness', () => {
  it('accepts a structurally valid starter map', () => {
    const result = validateMapDocument(createStarterMap());
    expect(result.valid).toBe(true);
    expect(result.ready).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('reports unknown terrain ids with a precise cell path', () => {
    const base = createStarterMap();
    const document = {
      ...base,
      layers: base.layers.map(layer => layer.id === 'ground'
        ? { ...layer, cells: layer.cells.map((cell, index) => index === 0 ? { tileId: 'unknown-biome-tile' } : cell) }
        : layer),
    };

    const result = validateMapDocument(document);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({
      code: 'terrain.id.unknown',
      severity: 'error',
      path: 'layers[0].cells[0].tileId',
    }));
  });

  it('reports cell arrays that do not match map dimensions', () => {
    const base = createStarterMap();
    const document = {
      ...base,
      layers: base.layers.map(layer => layer.id === 'ground'
        ? { ...layer, cells: layer.cells.slice(0, -1) }
        : layer),
    };

    expect(validateMapDocument(document).issues).toContainEqual(expect.objectContaining({
      code: 'layer.cells.count_mismatch',
      severity: 'error',
    }));
  });

  it('rejects objects whose footprint extends beyond map bounds', () => {
    const base = createStarterMap();
    const document = {
      ...base,
      layers: base.layers.map(layer => layer.id === 'objects'
        ? {
            ...layer,
            objects: [{
              id: 'outside',
              kind: 'decoration' as const,
              category: 'tree',
              x: base.width - 1,
              y: 0,
              width: 2,
              height: 1,
              assetId: 'tree',
              rotation: 0,
              zIndex: 0,
              collision: false,
            }],
          }
        : layer),
    };

    expect(validateMapDocument(document).issues).toContainEqual(expect.objectContaining({
      code: 'object.bounds.out_of_map',
      severity: 'error',
      path: 'layers[1].objects[0]',
    }));
  });

  it('rejects objects stored on a non-object layer', () => {
    const base = createStarterMap();
    const document = {
      ...base,
      layers: base.layers.map(layer => layer.id === 'ground'
        ? {
            ...layer,
            objects: [{
              id: 'wrong-layer',
              kind: 'decoration' as const,
              category: 'tree',
              x: 1,
              y: 1,
              width: 1,
              height: 1,
              assetId: 'tree',
              rotation: 0,
              zIndex: 0,
              collision: false,
            }],
          }
        : layer),
    };

    expect(validateMapDocument(document).issues).toContainEqual(expect.objectContaining({
      code: 'object.layer.invalid',
      severity: 'error',
      path: 'layers[0].objects[0]',
    }));
  });
});
