import type { MapDocument, MapLayer, MapObject } from './map-document';
import { MAP_CAPABILITIES } from './map-document';

export type ValidationSeverity = 'error' | 'warning';
export type MapValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path?: string;
};

export type MapValidationResult = {
  valid: boolean;
  ready: boolean;
  issues: MapValidationIssue[];
};

const issue = (
  issues: MapValidationIssue[],
  code: string,
  severity: ValidationSeverity,
  message: string,
  path?: string,
) => issues.push({ code, severity, message, path });

const layerKinds = new Set(['ground', 'objects', 'collision']);

function validateLayers(document: MapDocument, issues: MapValidationIssue[]) {
  if (!Array.isArray(document.layers) || document.layers.length === 0) {
    issue(issues, 'layers.missing', 'error', 'Map must contain at least one layer.', 'layers');
    return;
  }

  const ids = new Set<string>();
  let activeCount = 0;

  document.layers.forEach((layer: MapLayer, index) => {
    const path = `layers[${index}]`;
    if (!layer.id) issue(issues, 'layer.id.missing', 'error', 'Layer id is required.', `${path}.id`);
    if (ids.has(layer.id)) issue(issues, 'layer.id.duplicate', 'error', 'Layer ids must be unique.', `${path}.id`);
    ids.add(layer.id);
    if (!layerKinds.has(layer.kind)) issue(issues, 'layer.kind.invalid', 'error', 'Layer kind is invalid.', `${path}.kind`);
    if (layer.active) activeCount += 1;
    if (!Array.isArray(layer.cells)) issue(issues, 'layer.cells.invalid', 'error', 'Layer cells must be an array.', `${path}.cells`);
    if (!Array.isArray(layer.objects)) issue(issues, 'layer.objects.invalid', 'error', 'Layer objects must be an array.', `${path}.objects`);
  });

  if (activeCount !== 1) {
    issue(issues, 'layers.active.invalid', 'error', 'Exactly one layer must be active.', 'layers');
  }
}

function validateObjects(document: MapDocument, issues: MapValidationIssue[]) {
  const capabilities = MAP_CAPABILITIES[document.mapType];
  const ids = new Set<string>();

  document.layers.forEach((layer, layerIndex) => {
    layer.objects.forEach((object: MapObject, objectIndex) => {
      const path = `layers[${layerIndex}].objects[${objectIndex}]`;
      if (!object.id) issue(issues, 'object.id.missing', 'error', 'Object id is required.', `${path}.id`);
      if (ids.has(object.id)) issue(issues, 'object.id.duplicate', 'error', 'Object ids must be unique.', `${path}.id`);
      ids.add(object.id);
      if (!Number.isFinite(object.x) || !Number.isFinite(object.y)) issue(issues, 'object.position.invalid', 'error', 'Object position must be finite.', path);
      if (!Number.isFinite(object.width) || object.width <= 0 || !Number.isFinite(object.height) || object.height <= 0) {
        issue(issues, 'object.size.invalid', 'error', 'Object width and height must be positive.', path);
      }
      if (!Number.isFinite(object.rotation)) issue(issues, 'object.rotation.invalid', 'error', 'Object rotation must be finite.', `${path}.rotation`);
      if (!object.assetId) issue(issues, 'object.asset.missing', 'warning', 'Object has no asset id.', `${path}.assetId`);
      if (object.collision && !capabilities.collision) {
        issue(issues, 'object.collision.unsupported', 'error', 'This map type does not support collision objects.', path);
      }
    });
  });
}

export function validateMapDocument(document: MapDocument | null | undefined): MapValidationResult {
  const issues: MapValidationIssue[] = [];

  if (!document) {
    issue(issues, 'document.missing', 'error', 'MapDocument is required.');
    return { valid: false, ready: false, issues };
  }

  if (document.version !== 1) issue(issues, 'document.version.invalid', 'error', 'Unsupported MapDocument version.', 'version');
  if (!document.id) issue(issues, 'document.id.missing', 'error', 'Map id is required.', 'id');
  if (!document.name?.trim()) issue(issues, 'document.name.missing', 'error', 'Map name is required.', 'name');
  if (!Number.isInteger(document.width) || document.width <= 0) issue(issues, 'document.width.invalid', 'error', 'Map width must be a positive integer.', 'width');
  if (!Number.isInteger(document.height) || document.height <= 0) issue(issues, 'document.height.invalid', 'error', 'Map height must be a positive integer.', 'height');
  if (!Number.isFinite(document.tileSize) || document.tileSize <= 0) issue(issues, 'document.tile_size.invalid', 'error', 'Tile size must be positive.', 'tileSize');
  if (!(document.mapType in MAP_CAPABILITIES)) issue(issues, 'document.map_type.invalid', 'error', 'Map type is invalid.', 'mapType');

  validateLayers(document, issues);
  validateObjects(document, issues);

  const errors = issues.filter((entry) => entry.severity === 'error');
  return {
    valid: errors.length === 0,
    ready: errors.length === 0,
    issues,
  };
}

export function isMapReady(document: MapDocument | null | undefined): boolean {
  return validateMapDocument(document).ready;
}
