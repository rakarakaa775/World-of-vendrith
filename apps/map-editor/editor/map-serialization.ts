import type { MapDocument, MapLayer, MapLayerGroup, MapLayerTemplate } from './map-document';

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
  if (candidate.opacity !== undefined && (typeof candidate.opacity !== 'number' || !Number.isFinite(candidate.opacity) || candidate.opacity < 0 || candidate.opacity > 1)) throw new Error('Map layer opacity is invalid');
  if (candidate.groupId !== undefined && candidate.groupId !== null && typeof candidate.groupId !== 'string') throw new Error('Map layer groupId is invalid');
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
  if (candidate.childMapId !== undefined && candidate.childMapId !== null && typeof candidate.childMapId !== 'string') {
    throw new Error('Map object childMapId is invalid');
  }
  if (candidate.interiorMapId !== undefined && candidate.interiorMapId !== null && typeof candidate.interiorMapId !== 'string') {
    throw new Error('Map object interiorMapId is invalid');
  }
}

function validateHierarchySemantics(document: Partial<MapDocument>): void {
  if (document.mapType === 'world') {
    if (document.parentMapId !== null && document.parentMapId !== undefined) {
      throw new Error('World map cannot have a parent map');
    }
    return;
  }

  if (document.mapType === 'region') {
    if (typeof document.parentMapId !== 'string' || document.parentMapId.trim() === '') {
      throw new Error('Region map must reference a parent world map');
    }
    return;
  }

  if (document.mapType === 'playable') {
    const space = document.playableSpace ?? 'exterior';
    if (space === 'interior') {
      if (typeof document.parentPlayableMapId !== 'string' || document.parentPlayableMapId.trim() === '') {
        throw new Error('Interior playable map must reference a parent playable map');
      }
    } else if (document.parentMapId !== null && document.parentMapId !== undefined && typeof document.parentMapId !== 'string') {
      throw new Error('Exterior playable parentMapId is invalid');
    }
  }
}

function validateRelationshipMetadata(document: Partial<MapDocument>): void {
  if (document.parentMapId !== null && typeof document.parentMapId !== 'string') {
    throw new Error('Map parentMapId is invalid');
  }
  if (document.parentBounds !== undefined && document.parentBounds !== null) {
    const bounds = document.parentBounds;
    if (!bounds || typeof bounds !== 'object') throw new Error('Map parentBounds is invalid');
    for (const field of ['x', 'y', 'width', 'height'] as const) {
      if (typeof bounds[field] !== 'number' || !Number.isFinite(bounds[field])) throw new Error(`Map parentBounds ${field} is invalid`);
    }
    if (bounds.width <= 0 || bounds.height <= 0) throw new Error('Map parentBounds dimensions must be positive');
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
  const rawGroups = rawDocument.layerGroups;
  const rawTemplates = rawDocument.layerTemplates;
  const layerTemplates: MapLayerTemplate[] = Array.isArray(rawTemplates) ? rawTemplates.map(template => ({
    ...(template as Record<string, unknown>),
    id: typeof (template as Record<string, unknown>).id === 'string' ? (template as Record<string, unknown>).id : '',
    name: typeof (template as Record<string, unknown>).name === 'string' ? (template as Record<string, unknown>).name : '',
    kind: (template as Record<string, unknown>).kind,
    visible: (template as Record<string, unknown>).visible !== false,
    locked: (template as Record<string, unknown>).locked === true,
    opacity: typeof (template as Record<string, unknown>).opacity === 'number' ? (template as Record<string, unknown>).opacity : 1,
    groupId: (template as Record<string, unknown>).groupId ?? null,
  }) as MapLayerTemplate) : [];
  const layerGroups: MapLayerGroup[] = Array.isArray(rawGroups) ? rawGroups.map(group => ({
    ...(group as Record<string, unknown>),
    id: typeof (group as Record<string, unknown>).id === 'string' ? (group as Record<string, unknown>).id : '',
    name: typeof (group as Record<string, unknown>).name === 'string' ? (group as Record<string, unknown>).name : '',
    visible: (group as Record<string, unknown>).visible !== false,
    locked: (group as Record<string, unknown>).locked === true,
    expanded: (group as Record<string, unknown>).expanded !== false,
  }) as MapLayerGroup) : [];
  const expectedCellCount = width * height;
  validateRelationshipMetadata(normalizedDocument);
  validateHierarchySemantics(normalizedDocument);
  for (const layer of layers) validateLayerSemantics(layer, expectedCellCount);
  const templateIds = new Set<string>();
  for (const template of layerTemplates) {
    if (!template.id || templateIds.has(template.id) || !template.name || !['ground','objects','collision'].includes(String(template.kind))) throw new Error('Map layer template metadata is invalid');
    if (typeof template.opacity !== 'number' || template.opacity < 0 || template.opacity > 1) throw new Error('Map layer template opacity is invalid');
    if (template.groupId !== null && typeof template.groupId !== 'string') throw new Error('Map layer template groupId is invalid');
    templateIds.add(template.id);
  }
  const groupIds = new Set<string>();
  for (const group of layerGroups) {
    if (!group.id || groupIds.has(group.id) || !group.name) throw new Error('Map layer group metadata is invalid');
    groupIds.add(group.id);
  }
  const normalizedLayers = layers.map(layer => {
    const normalized = {
      ...(layer as MapLayer),
      opacity: typeof (layer as MapLayer).opacity === 'number' ? (layer as MapLayer).opacity : 1,
    };
    if (Object.prototype.hasOwnProperty.call(layer, 'groupId')) {
      normalized.groupId = (layer as MapLayer).groupId ?? null;
    } else {
      delete normalized.groupId;
    }
    return normalized;
  });
  for (const layer of normalizedLayers) if (layer.groupId && !groupIds.has(layer.groupId)) throw new Error('Map layer references an unknown group');
  for (const template of layerTemplates) if (template.groupId && !groupIds.has(template.groupId)) throw new Error('Map layer template references an unknown group');

  return {
    ...normalizedDocument,
    id: normalizedDocument.id,
    name: normalizedDocument.name,
    mapType: normalizedDocument.mapType,
    width,
    height,
    tileSize,
    layers: normalizedLayers,
    layerGroups,
    layerTemplates,
    version: MAP_DOCUMENT_VERSION,
  } as MapDocument;
}

export function cloneMapDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}