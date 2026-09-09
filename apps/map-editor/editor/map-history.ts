import type { MapDocument } from './map-document';

export type MapHistory = { past: MapDocument[]; present: MapDocument; future: MapDocument[] };

export function createHistory(document: MapDocument): MapHistory {
  return { past: [], present: document, future: [] };
}

export function commitHistory(history: MapHistory, next: MapDocument): MapHistory {
  if (next === history.present) return history;
  return { past: [...history.past, history.present], present: next, future: [] };
}

export function undoHistory(history: MapHistory): MapHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redoHistory(history: MapHistory): MapHistory {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
}
