import type { MapDocument } from './map-document';

export const MAP_DOCUMENT_SCHEMA = 'vandrith.map-document';
export const MAP_DOCUMENT_VERSION = 1 as const;
const MAP_DOCUMENT_PARSER_MARKER = 'map-document-parser-v3';

type SerializedMapDocument = {
  schema: typeof MAP_DOCUMENT_SCHEMA;
  version: typeof MAP_DOCUMENT_VERSION;
  document: MapDocument;
};

function validateIdentity(document: Partial<MapDocument>): void {
  const id = document.id;
  const name = document.name;
  const mapType = document.mapType;
  const missing: string[] = [];
  if (typeof id !== 'string' || id.trim() === '') missing.push('id');
  if (typeof name !== 'string' || name.trim() === '') missing.push('name');
  if (mapType !== 'world' && mapType !== 'region' && mapType !== 'playable') missing.push('mapType');
  if (missing.length > 0) {
    throw new Error(`${MAP_DOCUMENT_PARSER_MARKER}: Map document identity is incomplete; missing=${missing.join(',')}; observed={id:${JSON.stringify(id)},name:${JSON.stringify(name)},mapType:${JSON.stringify(mapType)}}`);
  }
}

export function serializeMapDocument(document: MapDocument): string {
  const payload: SerializedMapDocument = { schema: MAP_DOCUMENT_SCHEMA, version: MAP_DOCUMENT_VERSION, document };
  return JSON.stringify(payload, null, 2);
}

export function parseMapDocument(value: string | MapDocument, requestedMapId?: string): MapDocument {
  const payload: unknown = typeof value === 'string'
    ? JSON.parse(value)
    : { schema: MAP_DOCUMENT_SCHEMA, version: MAP_DOCUMENT_VERSION, document: value };
  if (!payload || typeof payload !== 'object') throw new Error('Invalid map document payload');
  const candidate = payload as Partial<SerializedMapDocument>;
  if (candidate.schema !== MAP_DOCUMENT_SCHEMA) throw new Error('Unsupported map document schema');
  if (candidate.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported map document version');
  if (!candidate.document || typeof candidate.document !== 'object') throw new Error('Missing map document');

  // Read persisted identity into local primitives before validation. This keeps
  // the validation boundary independent from structural/type assertions and
  // makes a contradictory runtime failure observable with the exact values.
  const rawDocument = candidate.document as Record<string, unknown>;
  const normalizedDocument = {
    ...rawDocument,
    id: rawDocument.id,
    name: rawDocument.name,
    mapType: rawDocument.mapType,
  } as Partial<MapDocument>;
  if (normalizedDocument.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported document version');
  validateIdentity(normalizedDocument);
  if (requestedMapId && normalizedDocument.id !== requestedMapId) throw new Error('Loaded map identity does not match requested map');
  if (!Number.isInteger(normalizedDocument.width) || normalizedDocument.width <= 0) throw new Error('Map width must be a positive integer');
  if (!Number.isInteger(normalizedDocument.height) || normalizedDocument.height <= 0) throw new Error('Map height must be a positive integer');
  if (!Number.isInteger(normalizedDocument.tileSize) || normalizedDocument.tileSize <= 0) throw new Error('Tile size must be a positive integer');
  if (!Array.isArray(normalizedDocument.layers) || normalizedDocument.layers.length === 0) throw new Error('Map must contain at least one layer');
  const expectedCellCount = normalizedDocument.width * normalizedDocument.height;
  for (const layer of normalizedDocument.layers) {
    if (!layer || !Array.isArray(layer.cells)) throw new Error('Map layer cells are invalid');
    if (layer.cells.length !== expectedCellCount) throw new Error('Layer cell count must equal width × height');
  }
  return normalizedDocument as MapDocument;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}
