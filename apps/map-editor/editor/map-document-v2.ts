import { resizeMapDocument, type MapDocument } from "./map-document";
import {
  resizeTerrainSemantics,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

/**
 * Resize a v2 editor snapshot as one logical operation.
 *
 * The legacy MapDocument remains v1-shaped; its dimensions and terrain
 * semantics are transformed together so callers can commit the returned pair
 * as a single history entry. This helper does not persist or mutate runtime
 * projections.
 */
export type MapDocumentV2State = Readonly<{
  document: MapDocument;
  terrainSemantics: TerrainSemanticsSection;
}>;

export function resizeMapDocumentV2(
  state: MapDocumentV2State,
  width: number,
  height: number,
): MapDocumentV2State {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error("Map dimensions must be positive integers");
  }

  const document = resizeMapDocument(state.document, width, height);
  const terrainSemantics = resizeTerrainSemantics(state.terrainSemantics, width, height);

  return { document, terrainSemantics };
}
