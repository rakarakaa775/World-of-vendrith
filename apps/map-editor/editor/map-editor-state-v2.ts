import type { MapDocument } from "./map-document";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import { parseMapSnapshot, serializeMapDocumentV2 } from "./map-snapshot-v2";
import {
  resizeTerrainSemantics,
  validateTerrainSemantics,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

/**
 * Opt-in unified state boundary for the terrain v2 migration.
 * Legacy v1 maps intentionally carry no terrain semantics.
 */
export type MapEditorState =
  | Readonly<{ kind: "legacy"; document: MapDocument; terrainSemantics: null }>
  | Readonly<{ kind: "initialized"; document: MapDocument; terrainSemantics: TerrainSemanticsSection }>;

function canonicalDocument(document: MapDocument): MapDocument {
  return parseMapDocument(serializeMapDocument(document));
}

function legacyState(document: MapDocument): MapEditorState {
  return { kind: "legacy", document: canonicalDocument(document), terrainSemantics: null };
}

function initializedState(document: MapDocument, terrainSemantics: unknown): MapEditorState {
  const canonical = canonicalDocument(document);
  return {
    kind: "initialized",
    document: canonical,
    terrainSemantics: validateTerrainSemantics(canonical.width, canonical.height, terrainSemantics),
  };
}

/** Parse v1 without fabricating semantics; parse and validate v2 atomically. */
export function parseMapEditorState(input: string | unknown, requestedMapId?: string): MapEditorState {
  const parsed = parseMapSnapshot(input, requestedMapId);
  if (parsed.format === "v1") return legacyState(parsed.document);
  return initializedState(parsed.state.document, parsed.state.terrainSemantics);
}

/** Legacy state cannot accidentally be serialized as an initialized v2 snapshot. */
export function serializeInitializedMapEditorState(state: MapEditorState): string {
  if (state.kind !== "initialized") {
    throw new Error("Cannot serialize legacy state as v2 before terrain semantics are initialized");
  }
  return serializeMapDocumentV2({ document: state.document, terrainSemantics: state.terrainSemantics });
}

/** Explicit transition; no semantics are inferred from tiles or map type. */
export function initializeTerrainSemantics(
  state: MapEditorState,
  semantics: TerrainSemanticsSection,
): MapEditorState {
  return initializedState(state.document, semantics);
}

/**
 * Validates the document before returning a new state. Map identity changes
 * clear semantics; same-map resize clips out-of-bounds records and invents none.
 */
export function replaceMapEditorDocument(state: MapEditorState, nextDocument: MapDocument): MapEditorState {
  const next = canonicalDocument(nextDocument);
  if (next.id !== state.document.id) return legacyState(next);
  if (state.kind === "legacy") return legacyState(next);

  const nextSemantics =
    next.width === state.document.width && next.height === state.document.height
      ? state.terrainSemantics
      : resizeTerrainSemantics(state.terrainSemantics, next.width, next.height);

  return initializedState(next, nextSemantics);
}
