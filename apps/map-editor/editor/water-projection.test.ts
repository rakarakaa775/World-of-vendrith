import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { deriveWaterProjection, normalizeLegacyWaterBands } from './water-projection';

function withCells(width: number, height: number, cells: string[]) {
  const base = createMap('world');
  return {
    ...base,
    width,
    height,
    layers: base.layers.map(layer =>
      layer.id === 'ground'
        ? { ...layer, cells: cells.map(tileId => ({ tileId })) }
        : { ...layer, cells: Array.from({ length: width * height }, () => ({ tileId: null })) },
    ),
  };
}

describe('deriveWaterProjection', () => {
  it('derives bands without mutating canonical MapDocument cells', () => {
    const document = withCells(7, 1, [
      'deepwater', 'deepwater', 'deepwater', 'grass', 'deepwater', 'deepwater', 'deepwater',
    ]);
    const before = JSON.stringify(document);

    const projection = deriveWaterProjection(document, 'ground');

    expect(projection?.bands).toEqual([
      'deepwater2', 'brackish', 'water', null, 'water', 'brackish', 'deepwater2',
    ]);
    expect(JSON.stringify(document)).toBe(before);
  });

  it('is deterministic for the same canonical input', () => {
    const document = withCells(9, 5, Array.from({ length: 45 }, (_, i) =>
      i === 22 ? 'grass' : 'deepwater',
    ));
    expect(deriveWaterProjection(document, 'ground'))
      .toEqual(deriveWaterProjection(document, 'ground'));
  });

  it('projects a no-land World Map as a deepwater floor without rewriting cells', () => {
    const document = withCells(4, 1, ['water', 'brackish', 'deepwater2', 'deepwater']);
    const before = JSON.stringify(document);

    const projection = deriveWaterProjection(document, 'ground');

    expect(projection?.bands).toEqual(['deepwater', 'deepwater', 'deepwater', 'deepwater']);
    expect(JSON.stringify(document)).toBe(before);
  });

  it('returns null for missing or non-ground layers', () => {
    const document = withCells(2, 1, ['deepwater', 'grass']);
    expect(deriveWaterProjection(document, 'missing')).toBeNull();
    const objects = document.layers.find(layer => layer.kind === 'objects')!;
    expect(deriveWaterProjection(document, objects.id)).toBeNull();
  });

  it('preserves the grid shape and leaves non-water cells without a water band', () => {
    const document = withCells(3, 1, ['deepwater', 'grass', 'deepwater']);
    const projection = deriveWaterProjection(document, 'ground');
    expect(projection?.bands).toHaveLength(3);
    expect(projection?.bands[1]).toBeNull();
  });
});


describe('normalizeLegacyWaterBands', () => {
  it('collapses legacy water bands only when explicitly called', () => {
    const document = withCells(4, 1, ['water', 'brackish', 'deepwater2', 'deepwater']);
    const before = JSON.stringify(document);
    expect(JSON.stringify(document)).toBe(before);

    const normalized = normalizeLegacyWaterBands(document);
    expect(normalized.layers.find(layer => layer.id === 'ground')?.cells.map(cell => cell.tileId))
      .toEqual(['water', 'water', 'water', 'water']);
    expect(document.layers.find(layer => layer.id === 'ground')?.cells.map(cell => cell.tileId))
      .toEqual(['water', 'brackish', 'deepwater2', 'deepwater']);
  });

  it('rejects malformed ground cell counts rather than deriving a partial projection', () => {
    const document = withCells(3, 1, ['deepwater', 'grass', 'deepwater']);
    const malformed = {
      ...document,
      layers: document.layers.map(layer =>
        layer.id === 'ground' ? { ...layer, cells: layer.cells.slice(0, 2) } : layer,
      ),
    };
    expect(() => deriveWaterProjection(malformed, 'ground'))
      .toThrow('exactly width × height ground cells');
  });
});
