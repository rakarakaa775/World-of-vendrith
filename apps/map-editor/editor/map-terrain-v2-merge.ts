import type { MapDocumentV2State } from "./map-history-v2";
import { mergeMapDocumentsThreeWay, type MapMergeResult } from "./map-entity-merge";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import { validateTerrainSemantics } from "./terrain-semantics";
import {
  mergeTerrainSemanticsThreeWay,
  type TerrainSemanticMergeConflict,
} from "./terrain-semantics-merge";

export type MapAndTerrainMergeResult =
  | {
      status: "merged";
      state: MapDocumentV2State;
      documentMerge: MapMergeResult;
      terrainConflicts: readonly [];
    }
  | {
      status: "conflict";
      preview: MapDocumentV2State;
      documentMerge: MapMergeResult;
      terrainConflicts: readonly TerrainSemanticMergeConflict[];
      reason: "document-conflict" | "terrain-conflict" | "document-and-terrain-conflict";
    };

function validateV2State(state: MapDocumentV2State): void {
  if (!state || typeof state !== "object" || !state.document) {
    throw new Error("Terrain v2 merge state must contain a document");
  }
  parseMapDocument(serializeMapDocument(state.document));
  validateTerrainSemantics(
    state.document.width,
    state.document.height,
    state.terrainSemantics,
  );
}

/**
 * Combines document and terrain-semantic three-way merges without persistence.
 *
 * Map identity and dimensions must match across all three states. This
 * deliberately rejects concurrent resizes instead of guessing how semantic
 * coordinates should be remapped. Any conflict returns a preview only; callers
 * must not adopt or persist it while either conflict collection is non-empty.
 */
export function mergeMapAndTerrainV2ThreeWay(
  base: MapDocumentV2State,
  local: MapDocumentV2State,
  remote: MapDocumentV2State,
): MapAndTerrainMergeResult {
  for (const state of [base, local, remote]) {
    if (!state || typeof state !== "object" || !state.document) {
      throw new Error("Terrain v2 merge state must contain a document");
    }
  }

  const first = base.document;
  const rest = [local.document, remote.document];
  if (rest.some((document) => document.id !== first.id)) {
    throw new Error("Cannot merge different map identities");
  }
  if (rest.some((document) =>
    document.width !== first.width || document.height !== first.height
  )) {
    throw new Error("Cannot merge terrain v2 states with different dimensions");
  }

  // Check identity/dimensions before deep validation so a concurrent resize
  // is rejected by this policy even if its old layer arrays no longer fit.
  validateV2State(base);
  validateV2State(local);
  validateV2State(remote);

  const documentMerge = mergeMapDocumentsThreeWay(
    base.document,
    local.document,
    remote.document,
  );
  const terrainMerge = mergeTerrainSemanticsThreeWay(
    first.width,
    first.height,
    base.terrainSemantics,
    local.terrainSemantics,
    remote.terrainSemantics,
  );
  const hasDocumentConflicts = documentMerge.conflicts.length > 0;
  const hasTerrainConflicts = terrainMerge.conflicts.length > 0;
  const preview: MapDocumentV2State = {
    document: documentMerge.document,
    terrainSemantics: terrainMerge.terrainSemantics,
  };

  if (hasDocumentConflicts || hasTerrainConflicts) {
    return {
      status: "conflict",
      preview,
      documentMerge,
      terrainConflicts: terrainMerge.conflicts,
      reason: hasDocumentConflicts && hasTerrainConflicts
        ? "document-and-terrain-conflict"
        : hasDocumentConflicts
          ? "document-conflict"
          : "terrain-conflict",
    };
  }

  return {
    status: "merged",
    state: preview,
    documentMerge,
    terrainConflicts: [],
  };
}
