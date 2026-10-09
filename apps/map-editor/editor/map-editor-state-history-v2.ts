import type { MapDocument } from "./map-document";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import {
  validateTerrainSemantics,
} from "./terrain-semantics";
import type { MapEditorState } from "./map-editor-state-v2";

export type MapEditorStateHistory = Readonly<{
  past: readonly MapEditorState[];
  present: MapEditorState;
  future: readonly MapEditorState[];
}>;

/** Keep memory bounded while preserving combined document+semantics entries. */
export const MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES = 100;

function validateState(state: MapEditorState): void {
  if (!state || typeof state !== "object" || !state.document) {
    throw new Error("Map editor state history entry is invalid");
  }
  const document: MapDocument = parseMapDocument(serializeMapDocument(state.document));
  if (state.kind === "legacy") {
    if (state.terrainSemantics !== null) {
      throw new Error("Legacy map editor state must not contain terrain semantics");
    }
    return;
  }
  if (state.kind !== "initialized") throw new Error("Unknown map editor state kind");
  validateTerrainSemantics(document.width, document.height, state.terrainSemantics);
}

export function createMapEditorStateHistory(state: MapEditorState): MapEditorStateHistory {
  validateState(state);
  return { past: [], present: state, future: [] };
}

/**
 * Commits one atomic editor state. Cross-map changes must reset history rather
 * than entering undo history, preventing undo from restoring another map.
 */
export function commitMapEditorStateHistory(
  history: MapEditorStateHistory,
  next: MapEditorState,
): MapEditorStateHistory {
  if (next === history.present) return history;
  validateState(next);
  if (next.document.id !== history.present.document.id) {
    throw new Error("Map identity changed; reset map editor state history instead of committing");
  }
  return {
    past: [...history.past, history.present].slice(-MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES),
    present: next,
    future: [],
  };
}

/** Start a fresh undo/redo timeline when a different map is loaded. */
export function resetMapEditorStateHistory(state: MapEditorState): MapEditorStateHistory {
  return createMapEditorStateHistory(state);
}

export function undoMapEditorStateHistory(history: MapEditorStateHistory): MapEditorStateHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future].slice(0, MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES),
  };
}

export function redoMapEditorStateHistory(history: MapEditorStateHistory): MapEditorStateHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present].slice(-MAP_EDITOR_STATE_HISTORY_MAX_ENTRIES),
    present: next,
    future: history.future.slice(1),
  };
}
