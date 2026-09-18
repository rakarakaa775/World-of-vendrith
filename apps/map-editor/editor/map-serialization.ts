import type { MapDocument } from './map-document';

export const MAP_DOCUMENT_SCHEMA = 'vandrith.map-document';
export const MAP_DOCUMENT_VERSION = 1 as const;
const MAP_DOCUMENT_PARSER_MARKER = 'map-document-parser-v4';

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


function validateLayerSemantics(layer: unknown, expectedCellCount: number): void {
  if (!layer || typeof layer !== 'object') throw new Error('Map layer is invalid');
  const candidate = layer as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') throw new Error('Map layer id is invalid');
  if (typeof candidate.name !== 'string' || candidate.name.trim() === '') throw new Error('Map layer name is invalid');
  if (candidate.kind !== 'ground' && candidate.kind !== 'objects' && candidate.kind !== 'collision') {
    throw new Error('Map layer kind is invalid');
  }
  for (const field of ['visible', 'locked', 'active']) {
    if (typeof candidate[field] !== 'boolean') throw new Error(`Map layer ${field} flag is invalid`);
  }
  if (!Array.isArray(candidate.cells)) throw new Error('Map layer cells are invalid');
  if (candidate.cells.length !== expectedCellCount) throw new Error('Layer cell count must equal width × height');
  for (const cell of candidate.cells) {
    if (!cell || typeof cell !== 'object') throw new Error('Map cell is invalid');
    const tileId = (cell as Record<string, unknown>).tileId;
    if (tileId !== null && (typeof tileId !== 'string' || tileId.trim() === '')) {
      throw new Error('Map cell tileId is invalid');
    }
  }
  if (!Array.isArray(candidate.objects)) throw new Error('Map layer objects are invalid');
  for (const object of candidate.objects) validateObjectSemantics(object);
}

function validateObjectSemantics(object: unknown): void {
  if (!object || typeof object !== 'object') throw new Error('Map object is invalid');
  const candidate = object as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') throw new Error('Map object id is invalid');
  if (candidate.kind !== 'building' && candidate.kind !== 'decoration' && candidate.kind !== 'poi') {
    throw new Error('Map object kind is invalid');
  }
  if (typeof candidate.category !== 'string' || candidate.category.trim() === '') throw new Error('Map object category is invalid');
  for (const field of ['x', 'y', 'width', 'height', 'rotation', 'zIndex']) {
    if (typeof candidate[field] !== 'number' || !Number.isFinite(candidate[field])) {
      throw new Error(`Map object ${field} is invalid`);
    }
  }
  const width = candidate.width;
  const height = candidate.height;
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0 || typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
    throw new Error('Map object dimensions must be positive');
  }
  if (typeof candidate.assetId !== 'string' || candidate.assetId.trim() === '') throw new Error('Map object assetId is invalid');
  if (typeof candidate.collision !== 'boolean') throw new Error('Map object collision is invalid');
  if (candidate.playableMapId !== undefined && candidate.playableMapId !== null && typeof candidate.playableMapId !== 'string') {
    throw new Error('Map object playableMapId is invalid');
  }
}

function validateRelationshipMetadata(document: Partial<MapDocument>): void {
  if (document.parentMapId !== null && typeof document.parentMapId !== 'string') {
    throw new Error('Map parentMapId is invalid');
  }
  if (document.playableSpace !== undefined && document.playableSpace !== 'exterior' && document.playableSpace !== 'interior') {
    throw new Error('Playable space type is invalid');
  }
  if (document.parentPlayableMapId !== undefined && document.parentPlayableMapId !== null && typeof document.parentPlayableMapId !== 'string') {
    throw new Error('Map parentPlayableMapId is invalid');
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

export function parseMapDocument(value: string | MapDocument | SerializedMapDocument, requestedMapId?: string): MapDocument {
  const payload: unknown = typeof value === 'string'
    ? JSON.parse(value)
    : 'document' in value
      ? value
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
    width: rawDocument.width,
    height: rawDocument.height,
    tileSize: rawDocument.tileSize,
    layers: rawDocument.layers,
    version: rawDocument.version,
  } as Partial<MapDocument>;
  if (normalizedDocument.version !== MAP_DOCUMENT_VERSION) throw new Error('Unsupported document version');
  validateIdentity(normalizedDocument);
  if (requestedMapId && normalizedDocument.id !== requestedMapId) throw new Error('Loaded map identity does not match requested map');

  const width = requirePositiveInteger(normalizedDocument.width, 'width');
  const height = requirePositiveInteger(normalizedDocument.height, 'height');
  const tileSize = requirePositiveInteger(normalizedDocument.tileSize, 'tileSize');
  const layers = normalizedDocument.layers;
  if (!Array.isArray(layers) || layers.length === 0) throw new Error('Map must contain at least one layer');
  const expectedCellCount = width * height;
  validateRelationshipMetadata(normalizedDocument);
  for (const layer of layers) validateLayerSemantics(layer, expectedCellCount);

  return {
    ...normalizedDocument,
    id: normalizedDocument.id,
    name: normalizedDocument.name,
    mapType: normalizedDocument.mapType,
    width,
    height,
    tileSize,
    layers,
    version: MAP_DOCUMENT_VERSION,
  } as MapDocument;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}
