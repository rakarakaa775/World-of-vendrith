import type { MapDocument } from './map-document';
import { serializeMapDocument } from './map-serialization';

export type MapSnapshotIdentity = {
  mapId: string;
  revision: string;
  serialized: string;
};

export type MapConflict = {
  kind: 'remote-newer' | 'local-newer' | 'diverged';
  local: MapSnapshotIdentity;
  remote: MapSnapshotIdentity;
};

export type ConflictResolution = 'keep-local' | 'keep-remote' | 'manual';

export function createSnapshotIdentity(
  document: MapDocument,
  revision: string,
): MapSnapshotIdentity {
  return {
    mapId: document.id,
    revision,
    serialized: serializeMapDocument(document),
  };
}

export function detectMapConflict(
  base: MapSnapshotIdentity,
  local: MapSnapshotIdentity,
  remote: MapSnapshotIdentity,
): MapConflict | null {
  if (local.mapId !== remote.mapId || base.mapId !== local.mapId) {
    throw new Error('Map snapshot IDs do not match');
  }

  if (local.serialized === remote.serialized) return null;
  if (local.serialized === base.serialized && remote.serialized !== base.serialized) {
    return { kind: 'remote-newer', local, remote };
  }
  if (remote.serialized === base.serialized && local.serialized !== base.serialized) {
    return { kind: 'local-newer', local, remote };
  }
  return { kind: 'diverged', local, remote };
}

export function canAutoResolveConflict(conflict: MapConflict): boolean {
  return conflict.kind === 'local-newer' || conflict.kind === 'remote-newer';
}

export function defaultConflictResolution(conflict: MapConflict): ConflictResolution {
  return canAutoResolveConflict(conflict) ? 'manual' : 'manual';
}
