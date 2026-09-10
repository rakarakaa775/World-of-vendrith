import type { MapDocument } from './map-document';

export const MAP_DOCUMENT_SCHEMA = 'vandrith.map-document';
export const MAP_DOCUMENT_VERSION = 1 as const;

type SerializedMapDocument = {
  schema: typeof MAP_DOCUMENT_SCHEMA;
  version: typeof MAP_DOCUMENT_VERSION;
  document: MapDocument;
};

export function serializeMapDocument(document: MapDocument): string {
  const payload: SerializedMapDocument = {
    schema: MAP_DOCUMENT_SCHEMA,
    version: MAP_DOCUMENT_VERSION,
    document,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseMapDocument(value: string): MapDocument {
  const payload: unknown = JSON.parse(value);
  if (!payload || typeof payload !== 'object') throw new Error('Invalid map document payload');
  const candidate = payload as Partial<SerializedMapDocument>;
  if (candidate.schema !== MAP_DOCUMENT_SCHEMA) throw new Error('Unsupported map document schema');
  if (candidate.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported map document version');
  if (!candidate.document || typeof candidate.document !== 'object') throw new Error('Missing map document');
  const document = candidate.document as MapDocument;
  if (document.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported document version');
  if (!document.id || !document.name || !document.mapType) throw new Error('Map document identity is incomplete');
  if (!Number.isInteger(document.width) || document.width <= 0) throw new Error('Map width must be a positive integer');
  if (!Number.isInteger(document.height) || document.height <= 0) throw new Error('Map height must be a positive integer');
  if (!Number.isInteger(document.tileSize) || document.tileSize <= 0) throw new Error('Tile size must be a positive integer');
  if (!Array.isArray(document.layers) || document.layers.length === 0) throw new Error('Map must contain at least one layer');
  return document;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}
