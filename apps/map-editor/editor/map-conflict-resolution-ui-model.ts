import type { MapMergeResult, MergeConflict } from './map-entity-merge';
import type { MapDocument, MapLayer, MapObject, TileCell } from './map-document';

export type ConflictChoice = 'local' | 'remote' | 'base';
export type ConflictView = MergeConflict & { choice: ConflictChoice | null };
export type ConflictResolutionSession = { conflicts: ConflictView[]; selected: number };

export function createConflictResolutionSession(result: MapMergeResult): ConflictResolutionSession {
  return { conflicts: result.conflicts.map(c => ({ ...c, choice: null })), selected: 0 };
}

export function chooseConflict(session: ConflictResolutionSession, id: string, choice: ConflictChoice): ConflictResolutionSession {
  return { ...session, conflicts: session.conflicts.map(c => c.id === id ? { ...c, choice } : c) };
}

export function resolveAll(session: ConflictResolutionSession, choice: ConflictChoice): ConflictResolutionSession {
  return { ...session, conflicts: session.conflicts.map(c => ({ ...c, choice })) };
}

export function canApplyResolution(session: ConflictResolutionSession): boolean {
  return session.conflicts.every(c => c.choice !== null);
}

function setLayer(document: MapDocument, layerId: string, update: (layer: MapLayer) => void) {
  const layer = document.layers.find(l => l.id === layerId);
  if (layer) update(layer);
}

function applyValue(document: MapDocument, conflict: ConflictView): void {
  const value = conflict.choice === 'local' ? conflict.local : conflict.choice === 'remote' ? conflict.remote : conflict.base;
  if (conflict.kind === 'map-metadata') {
    (document as Record<string, unknown>)[conflict.id] = value;
    return;
  }
  const parts = conflict.id.split(':');
  const layerId = parts[0];
  if (conflict.kind === 'layer-metadata' && parts.length >= 2) {
    setLayer(document, layerId, layer => { (layer as Record<string, unknown>)[parts.slice(1).join(':')] = value; });
    return;
  }
  if (conflict.kind === 'terrain-cell' && parts[1] === 'cell') {
    const index = Number(parts[2]);
    if (Number.isInteger(index)) setLayer(document, layerId, layer => { layer.cells[index] = value as TileCell; });
    return;
  }
  if (conflict.kind === 'object' && parts[1] === 'object') {
    const objectId = parts.slice(2).join(':');
    setLayer(document, layer => {
      const index = layer.objects.findIndex(object => object.id === objectId);
      if (value === null) { if (index >= 0) layer.objects.splice(index, 1); return; }
      if (index >= 0) layer.objects[index] = value as MapObject;
      else layer.objects.push(value as MapObject);
    });
  }
}

export function applyResolution(result: MapMergeResult, session: ConflictResolutionSession): MapDocument {
  if (!canApplyResolution(session)) throw new Error('Cannot apply unresolved conflicts');
  const document = structuredClone(result.document) as MapDocument;
  for (const conflict of session.conflicts) applyValue(document, conflict);
  return document;
}
