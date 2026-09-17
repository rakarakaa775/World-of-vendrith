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

function requirePositiveInteger(value: unknown, label: 'width' | 'height' | 'tileSize'): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    const messages = {
      width: 'Map width must be a positive integer',
      height: 'Map height must be a positive integer',
      tileSize: 'Tile size must be a positive integer',
    } as const;
    throw new Error(messages[label]);
  }
  return value;
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

  const width = requirePositiveInteger(normalizedDocument.width, 'width');
  const height = requirePositiveInteger(normalizedDocument.height, 'height');
  requirePositiveInteger(normalizedDocument.tileSize, 'tileSize');
  const layers = normalizedDocument.layers;
  if (!Array.isArray(layers) || layers.length === 0) throw new Error('Map must contain at least one layer');
  const expectedCellCount = width * height;
  for (const layer of layers) {
    if (!layer || !Array.isArray(layer.cells)) throw new Error('Map layer cells are invalid');
    if (layer.cells.length !== expectedCellCount) throw new Error('Layer cell count must equal width × height');
  }
  return normalizedDocument as MapDocument;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}
