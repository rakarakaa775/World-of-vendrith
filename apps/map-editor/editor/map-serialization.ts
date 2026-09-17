import type { MapDocument } from './map-document';

export const MAP_DOCUMENT_SCHEMA = 'vandrith.map-document';
export const MAP_DOCUMENT_VERSION = 1 as const;
const MAP_DOCUMENT_PARSER_MARKER = 'map-document-parser-v2';

type SerializedMapDocument = {
  schema: typeof MAP_DOCUMENT_SCHEMA;
  version: typeof MAP_DOCUMENT_VERSION;
  document: MapDocument;
};

function requireIdentity(document: Partial<MapDocument>): asserts document is MapDocument {
  const missing: string[] = [];
  if (typeof document.id !== 'string' || document.id.trim() === '') missing.push('id');
  if (typeof document.name !== 'string' || document.name.trim() === '') missing.push('name');
  if (document.mapType !== 'world' && document.mapType !== 'region' && document.mapType !== 'playable') missing.push('mapType');
  if (missing.length > 0) {
    throw new Error(`${MAP_DOCUMENT_PARSER_MARKER}: Map document identity is incomplete; missing=${missing.join(',')}`);
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
  const document = candidate.document as Partial<MapDocument>;
  if (document.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported document version');
  requireIdentity(document);
  if (requestedMapId && document.id !== requestedMapId) throw new Error('Loaded map identity does not match requested map');
  if (!Number.isInteger(document.width) || document.width <= 0) throw new Error('Map width must be a positive integer');
  if (!Number.isInteger(document.height) || document.height <= 0) throw new Error('Map height must be a positive integer');
  if (!Number.isInteger(document.tileSize) || document.tileSize <= 0) throw new Error('Tile size must be a positive integer');
  if (!Array.isArray(document.layers) || document.layers.length === 0) throw new Error('Map must contain at least one layer');
  const expectedCellCount = document.width * document.height;
  for (const layer of document.layers) {
    if (!layer || !Array.isArray(layer.cells)) throw new Error('Map layer cells are invalid');
    if (layer.cells.length !== expectedCellCount) throw new Error('Layer cell count must equal width × height');
  }
  return document;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}
