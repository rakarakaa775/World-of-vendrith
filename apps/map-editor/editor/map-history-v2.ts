import type { MapDocument } from "./map-document";
import type { TerrainSemanticsSection } from "./terrain-semantics";

/**
 * History for the combined v2 authoring snapshot. Document and semantics are
 * kept in the same history entry so undo/redo cannot restore only half a state.
 * This helper is intentionally separate from the current v1 editor history
 * until persistence and UI adoption are migrated deliberately.
 */
export type MapDocumentV2State = Readonly<{
  document: MapDocument;
  terrainSemantics: TerrainSemanticsSection;
}>;

export type MapHistoryV2 = Readonly<{
  past: readonly MapDocumentV2State[];
  present: MapDocumentV2State;
  future: readonly MapDocumentV2State[];
}>;

export function createHistoryV2(state: MapDocumentV2State): MapHistoryV2 {
  return { past: [], present: state, future: [] };
}

export function commitHistoryV2(
  history: MapHistoryV2,
  next: MapDocumentV2State,
): MapHistoryV2 {
  if (next === history.present) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: [],
  };
}

export function undoHistoryV2(history: MapHistoryV2): MapHistoryV2 {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistoryV2(history: MapHistoryV2): MapHistoryV2 {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
