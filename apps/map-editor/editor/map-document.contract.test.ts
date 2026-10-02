import { describe, expect, it } from 'vitest';
import { createStarterMap, createMap, resizeMapDocument, MAP_SIZES, type MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

describe('MapDocument contract', () => {
  it('round-trips the canonical serialized envelope without losing identity or dimensions', () => {
    const document = createStarterMap();
    const parsed = parseMapDocument(serializeMapDocument(document), document.id);

    expect(parsed).toEqual(document);
    expect(parsed.id).toBe(document.id);
    expect(parsed.mapType).toBe('playable');
    expect(parsed.width * parsed.height).toBe(128 * 128);
  });

  it('rejects a requested map identity mismatch', () => {
    const document = createStarterMap();

    expect(() => parseMapDocument(serializeMapDocument(document), 'different-map'))
      .toThrow('Loaded map identity does not match requested map');
  });

  it('rejects malformed dimensions and layer cell counts', () => {
    const document = createStarterMap();
    const payload = JSON.parse(serializeMapDocument(document));
    payload.document.width = 64;

    expect(() => parseMapDocument(payload)).toThrow('Layer cell count must equal width × height');
  });

  it('rejects unsupported schema and document versions', () => {
    const document = createStarterMap();

    const unsupportedSchema = JSON.parse(serializeMapDocument(document));
    unsupportedSchema.schema = 'other.schema';
    expect(() => parseMapDocument(unsupportedSchema)).toThrow('Unsupported map document schema');

    const unsupportedVersion = JSON.parse(serializeMapDocument(document));
    unsupportedVersion.version = 999;
    expect(() => parseMapDocument(unsupportedVersion)).toThrow('Unsupported map document version');
  });

  it('supports the three editor map-size presets with matching layer cell counts', () => {
    expect(MAP_SIZES).toEqual([32, 64, 128]);

    for (const size of MAP_SIZES) {
      const document = createMap('playable', null, 'exterior', null, size, size);
      expect(document.width).toBe(size);
      expect(document.height).toBe(size);
      expect(document.layers.every(layer => layer.cells.length === size * size)).toBe(true);
    }
  });


  it('enforces world, region, exterior playable, and interior hierarchy semantics', () => {
    const world = createMap('world', null);
    expect(parseMapDocument(serializeMapDocument(world), world.id).mapType).toBe('world');

    const region = createMap('region', 'world-1');
    expect(parseMapDocument(serializeMapDocument(region), region.id).parentMapId).toBe('world-1');

    const exterior = createMap('playable', 'region-1', 'exterior');
    expect(parseMapDocument(serializeMapDocument(exterior), exterior.id).playableSpace).toBe('exterior');

    const interior = createMap('playable', null, 'interior', 'playable-1');
    expect(parseMapDocument(serializeMapDocument(interior), interior.id).parentPlayableMapId).toBe('playable-1');

    const invalidRegion = { ...region, parentMapId: null };
    expect(() => parseMapDocument(serializeMapDocument(invalidRegion), invalidRegion.id))
      .toThrow('Region map must reference a parent world map');

    const invalidInterior = { ...interior, parentPlayableMapId: null };
    expect(() => parseMapDocument(serializeMapDocument(invalidInterior), invalidInterior.id))
      .toThrow('Interior playable map must reference a parent playable map');
  });

  it('keeps resize semantics deterministic for existing cells', () => {
    const document = createMap('playable');
    const resized = resizeMapDocument(document, 2, 2);

    expect(resized.width).toBe(2);
    expect(resized.height).toBe(2);
    expect(resized.layers.every(layer => layer.cells.length === 4)).toBe(true);
  });
});
