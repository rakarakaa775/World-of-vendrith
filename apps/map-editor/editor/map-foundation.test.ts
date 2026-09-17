import { describe, expect, it } from 'vitest';
import { createEmptyCells, createMap } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

const makePayload = (width: number, height: number) => {
  const document = createMap('playable');
  document.width = width;
  document.height = height;
  document.layers = document.layers.map(layer => ({
    ...layer,
    cells: createEmptyCells(width, height),
  }));
  return document;
};

describe('MapDocument foundation invariants', () => {
  it('allocates exactly width × height cells', () => {
    expect(createEmptyCells(7, 5)).toHaveLength(35);
  });

  it('rejects invalid grid dimensions at allocation time', () => {
    expect(() => createEmptyCells(0, 5)).toThrow('Map width must be a positive integer');
    expect(() => createEmptyCells(7, 0)).toThrow('Map height must be a positive integer');
    expect(() => createEmptyCells(1.5, 5)).toThrow('Map width must be a positive integer');
  });

  it('creates a default document with dimension-safe layers', () => {
    const document = createMap('playable');
    expect(document.layers.every(layer => layer.cells.length === document.width * document.height)).toBe(true);
  });

  it('accepts a non-default dimension when every layer matches the grid', () => {
    const document = makePayload(7, 5);
    const parsed = parseMapDocument(serializeMapDocument(document), document.id);
    expect(parsed.width).toBe(7);
    expect(parsed.height).toBe(5);
    expect(parsed.layers.every(layer => layer.cells.length === 35)).toBe(true);
  });

  it('accepts the audited authoritative World Map identity from persisted JSON', () => {
    const document = makePayload(20, 12);
    document.id = '87ba34eb-5a75-42fa-8919-63e44b700c02';
    document.name = 'World Map';
    document.mapType = 'world';
    const serialized = serializeMapDocument(document);
    const parsed = parseMapDocument(serialized, document.id);
    expect(parsed.id).toBe('87ba34eb-5a75-42fa-8919-63e44b700c02');
    expect(parsed.name).toBe('World Map');
    expect(parsed.mapType).toBe('world');
  });

  it('accepts the same authoritative snapshot when Supabase returns an object', () => {
    const document = makePayload(20, 12);
    document.id = '87ba34eb-5a75-42fa-8919-63e44b700c02';
    document.name = 'World Map';
    document.mapType = 'world';
    const persistedObject = JSON.parse(serializeMapDocument(document));
    const parsed = parseMapDocument(persistedObject, document.id);
    expect(parsed.id).toBe(document.id);
    expect(parsed.name).toBe('World Map');
    expect(parsed.mapType).toBe('world');
  });

  it('rejects malformed persisted numeric fields at the parser boundary', () => {
    const document = makePayload(7, 5);
    const serialized = JSON.parse(serializeMapDocument(document)) as { document: Record<string, unknown> };

    serialized.document.width = '7';
    expect(() => parseMapDocument(serialized, document.id)).toThrow('Map width must be a positive integer');

    serialized.document.width = 7;
    serialized.document.height = 0;
    expect(() => parseMapDocument(serialized, document.id)).toThrow('Map height must be a positive integer');

    serialized.document.height = 5;
    serialized.document.tileSize = 0;
    expect(() => parseMapDocument(serialized, document.id)).toThrow('Tile size must be a positive integer');
  });

  it('rejects a persisted layer whose cell count does not match width × height', () => {
    const document = makePayload(7, 5);
    document.layers[0].cells = createEmptyCells(20, 12);
    expect(() => parseMapDocument(serializeMapDocument(document), document.id))
      .toThrow('Layer cell count must equal width × height');
  });
});
