import type { MapDocument } from './map-document';
import type { ConflictChoice, ConflictResolutionSession } from './map-conflict-resolution-ui-model';
import type { MergeConflict } from './map-entity-merge';

export type AppliedResolution = { id: string; choice: ConflictChoice; value: unknown };
export type ConflictResolutionApplyResult = { document: MapDocument; resolutions: AppliedResolution[] };

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function valueFor(conflict: MergeConflict, choice: ConflictChoice): unknown {
  if (choice === 'local') return conflict.local;
  if (choice === 'remote') return conflict.remote;
  return conflict.base;
}

function replaceAtPath(document: MapDocument, conflict: MergeConflict, value: unknown): MapDocument {
  const next = structuredClone(document) as MapDocument;
  const parts = conflict.id.split(':');
  const layerId = parts[0];
  const layer = next.layers.find(l => l.id === layerId);
  if (!layer) return next;

  if (parts[1] === 'cell') {
    const index = Number(parts[2]);
    if (Number.isInteger(index) && index >= 0) layer.cells[index] = value as never;
  } else if (parts[1] === 'object') {
    const objectId = parts.slice(2).join(':');
    const index = layer.objects.findIndex(o => o.id === objectId);
    if (value === null) {
      if (index >= 0) layer.objects.splice(index, 1);
    } else if (index >= 0) layer.objects[index] = value as never;
    else layer.objects.push(value as never);
  }
  return next;
}

export function applyConflictResolution(baseDocument: MapDocument, session: ConflictResolutionSession, originalConflicts: MergeConflict[]): ConflictResolutionApplyResult {
  if (session.conflicts.length !== originalConflicts.length) throw new Error('Resolution session does not match conflict set');
  if (session.conflicts.some(c => c.choice === null)) throw new Error('All conflicts must be resolved before applying');

  let document = baseDocument;
  const resolutions: AppliedResolution[] = [];
  for (const conflict of originalConflicts) {
    const view = session.conflicts.find(c => c.id === conflict.id);
    if (!view || !view.choice) throw new Error(`Missing resolution for ${conflict.id}`);
    const value = valueFor(conflict, view.choice);
    document = replaceAtPath(document, conflict, value);
    resolutions.push({ id: conflict.id, choice: view.choice, value });
  }
  return { document, resolutions };
}
