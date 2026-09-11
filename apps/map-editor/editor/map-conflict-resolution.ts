import type { MapDocument } from './map-document';
import type { MapConflict, ConflictResolution } from './map-conflict-detection';

export type ConflictResolutionResult = {
  resolution: ConflictResolution;
  document: MapDocument | null;
  requiresManualMerge: boolean;
};

export function resolveMapConflict(
  conflict: MapConflict,
  resolution: ConflictResolution,
  parse: (serialized: string) => MapDocument,
): ConflictResolutionResult {
  if (resolution === 'keep-local') {
    return {
      resolution,
      document: parse(conflict.local.serialized),
      requiresManualMerge: false,
    };
  }

  if (resolution === 'keep-remote') {
    return {
      resolution,
      document: parse(conflict.remote.serialized),
      requiresManualMerge: false,
    };
  }

  return {
    resolution: 'manual',
    document: null,
    requiresManualMerge: true,
  };
}

export function mergeMapDocumentsById(
  local: MapDocument,
  remote: MapDocument,
): MapDocument | null {
  if (local.id !== remote.id) return null;

  const localLayers = new Map(local.layers.map((layer) => [layer.id, layer]));
  const remoteLayers = new Map(remote.layers.map((layer) => [layer.id, layer]));
  const mergedLayers = [...new Set([...localLayers.keys(), ...remoteLayers.keys()])]
    .map((id) => localLayers.get(id) ?? remoteLayers.get(id)!)
    .filter(Boolean);

  return {
    ...remote,
    name: local.name,
    width: local.width,
    height: local.height,
    tileSize: local.tileSize,
    layers: mergedLayers,
  };
}
