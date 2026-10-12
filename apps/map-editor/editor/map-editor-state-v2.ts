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
