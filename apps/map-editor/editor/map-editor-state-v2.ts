import type { MapDocument } from "./map-document";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import type { MapDocumentV2State } from "./map-history-v2";
import { parseMapSnapshot, serializeMapDocumentV2 } from "./map-snapshot-v2";
import { resizeTerrainSemantics, validateTerrainSemantics, type TerrainSemanticsSection } from "./terrain-semantics";

/**
 * Transitional state explicitly distinguishes v1 data from initialized v2.
 * Legacy documents never acquire fabricated semantic terrain records.
 */
export type MapEditorStateV2 =
  | Readonly<{ format: "legacy-uninitialized"; document: MapDocument; terrainSemantics: null }>
  | Readonly<{ format: "v2"; state: MapDocumentV2State }>;

export function adoptMapSnapshotV2(input: string | unknown, requestedMapId?: string): MapEditorStateV2 {
  const parsed = parseMapSnapshot(input, requestedMapId);
  return parsed.format === "v1"
    ? { format: "legacy-uninitialized", document: parsed.document, terrainSemantics: null }
    : { format: "v2", state: parsed.state };
}

/**
 * Apply a document-only edit while preserving the explicit initialization
 * status. Same-map dimension changes clip records on shrink and never invent
 * records on expansion. Map identity changes require a fresh adoption.
 */
export function applyDocumentChangeV2(current: MapEditorStateV2, nextDocument: MapDocument): MapEditorStateV2 {
  // Validate the incoming document before using its dimensions to clip semantics.
  const validatedDocument = parseMapDocument(serializeMapDocument(nextDocument), nextDocument.id);
  const currentDocument = current.format === "v2" ? current.state.document : current.document;
  if (validatedDocument.id !== currentDocument.id) {
    throw new Error("Map identity changed; adopt a new snapshot instead of applying a document change");
  }
  if (current.format === "legacy-uninitialized") {
    return { format: "legacy-uninitialized", document: validatedDocument, terrainSemantics: null };
  }
  const terrainSemantics = currentDocument.width === validatedDocument.width && currentDocument.height === validatedDocument.height
    ? validateTerrainSemantics(validatedDocument.width, validatedDocument.height, current.state.terrainSemantics)
    : resizeTerrainSemantics(current.state.terrainSemantics, validatedDocument.width, validatedDocument.height);
  return { format: "v2", state: { document: validatedDocument, terrainSemantics } };
}

/** Initialize only when a caller deliberately supplies a semantic section. */
export function initializeTerrainSemanticsV2(document: MapDocument, terrainSemantics: TerrainSemanticsSection): MapEditorStateV2 {
  const validated = validateTerrainSemantics(document.width, document.height, terrainSemantics);
  const serialized = serializeMapDocumentV2({ document, terrainSemantics: validated });
  const parsed = parseMapSnapshot(serialized, document.id);
  if (parsed.format !== "v2") throw new Error("Terrain v2 initialization failed");
  return { format: "v2", state: parsed.state };
}


/**
 * Stable adapter contract used by Save/Load and combined editor history.
 * This is kept alongside the newer format-tagged transition API so the
 * persistence adapter can migrate independently from the live editor.
 */
export type MapEditorState =
  | Readonly<{ kind: "legacy"; document: MapDocument; terrainSemantics: null }>
  | Readonly<{ kind: "initialized"; document: MapDocument; terrainSemantics: TerrainSemanticsSection }>;

export function parseMapEditorState(input: string | unknown): MapEditorState {
  const parsed = parseMapSnapshot(input);
  return parsed.format === "v1"
    ? { kind: "legacy", document: parsed.document, terrainSemantics: null }
    : {
        kind: "initialized",
        document: parsed.state.document,
        terrainSemantics: parsed.state.terrainSemantics,
      };
}

export function serializeInitializedMapEditorState(state: MapEditorState): string {
  if (state.kind !== "initialized") {
    throw new Error("Only initialized map editor states can be serialized as Terrain v2");
  }
  return serializeMapDocumentV2({
    document: state.document,
    terrainSemantics: state.terrainSemantics,
  });
}

/** Explicitly initialize semantics; legacy input remains legacy until called. */
export function initializeTerrainSemantics(
  state: MapEditorState,
  terrainSemantics: TerrainSemanticsSection,
): MapEditorState {
  const initialized = initializeTerrainSemanticsV2(state.document, terrainSemantics);
  if (initialized.format !== "v2") throw new Error("Terrain v2 initialization failed");
  return {
    kind: "initialized",
    document: initialized.state.document,
    terrainSemantics: initialized.state.terrainSemantics,
  };
}

/** Apply a document edit without losing the initialization status. */
export function replaceMapEditorDocument(
  state: MapEditorState,
  nextDocument: MapDocument,
): MapEditorState {
  const transitional: MapEditorStateV2 = state.kind === "legacy"
    ? { format: "legacy-uninitialized", document: state.document, terrainSemantics: null }
    : { format: "v2", state: { document: state.document, terrainSemantics: state.terrainSemantics } };
  const changed = applyDocumentChangeV2(transitional, nextDocument);
  return changed.format === "legacy-uninitialized"
    ? { kind: "legacy", document: changed.document, terrainSemantics: null }
    : {
        kind: "initialized",
        document: changed.state.document,
        terrainSemantics: changed.state.terrainSemantics,
      };
}
