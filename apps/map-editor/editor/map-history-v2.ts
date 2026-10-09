import type { MapDocument } from "./map-document";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import {
  validateTerrainSemantics,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

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

/** Prevent long editing sessions from retaining an unbounded number of maps. */
export const MAP_HISTORY_V2_MAX_ENTRIES = 100;

function validateState(state: MapDocumentV2State): void {
  if (!state || typeof state !== "object") {
    throw new Error("Map history v2 state must be an object");
  }
  // Reuse canonical document invariants instead of trusting TypeScript types
  // at this runtime boundary (recovery/imported payloads can be malformed).
  parseMapDocument(serializeMapDocument(state.document));
  validateTerrainSemantics(
    state.document.width,
    state.document.height,
    state.terrainSemantics,
  );
}

export function createHistoryV2(state: MapDocumentV2State): MapHistoryV2 {
  validateState(state);
  return { past: [], present: state, future: [] };
}

export function commitHistoryV2(
  history: MapHistoryV2,
  next: MapDocumentV2State,
): MapHistoryV2 {
  if (next === history.present) return history;
  validateState(next);
  return {
    past: [...history.past, history.present].slice(-MAP_HISTORY_V2_MAX_ENTRIES),
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
    future: [history.present, ...history.future].slice(0, MAP_HISTORY_V2_MAX_ENTRIES),
  };
}

export function redoHistoryV2(history: MapHistoryV2): MapHistoryV2 {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present].slice(-MAP_HISTORY_V2_MAX_ENTRIES),
    present: next,
    future: history.future.slice(1),
  };
}
