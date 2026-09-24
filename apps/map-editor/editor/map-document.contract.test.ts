import { describe, expect, it } from 'vitest';
import { createStarterMap, createMap, resizeMapDocument } from './map-document';
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

  it('keeps resize semantics deterministic for existing cells', () => {
    const document = createMap('playable');
    const resized = resizeMapDocument(document, 2, 2);

    expect(resized.width).toBe(2);
    expect(resized.height).toBe(2);
    expect(resized.layers.every(layer => layer.cells.length === 4)).toBe(true);
  });
});
