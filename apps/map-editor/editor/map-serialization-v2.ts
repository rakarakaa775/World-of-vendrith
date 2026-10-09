import type { MapDocument } from "./map-document";
import { parseMapDocument, serializeMapDocument } from "./map-serialization";
import {
  TERRAIN_SEMANTICS_SCHEMA,
  TERRAIN_SEMANTICS_VERSION,
  validateTerrainSemantics,
  type TerrainSemanticsSection,
} from "./terrain-semantics";

export const MAP_DOCUMENT_V2_SCHEMA = "vandrith.map-document";
export const MAP_DOCUMENT_V2_VERSION = 2 as const;

/**
 * Version 2 envelope keeps MapDocument v1 intact and stores authored terrain
 * semantics in a separate, validated section. Legacy v1 parsing remains
 * delegated to the existing parser and never fabricates terrain semantics.
 */
export type SerializedMapDocumentV2 = Readonly<{
  schema: typeof MAP_DOCUMENT_V2_SCHEMA;
  version: typeof MAP_DOCUMENT_V2_VERSION;
  document: MapDocument;
  terrainSemantics: TerrainSemanticsSection;
}>;

export type ParsedMapDocumentV2 = Readonly<{
  document: MapDocument;
  terrainSemantics: TerrainSemanticsSection;
}>;

export function serializeMapDocumentV2(
  document: MapDocument,
  terrainSemantics: TerrainSemanticsSection,
): string {
  const validated = validateTerrainSemantics(document.width, document.height, terrainSemantics);
  return JSON.stringify({
    schema: MAP_DOCUMENT_V2_SCHEMA,
    version: MAP_DOCUMENT_V2_VERSION,
    document: JSON.parse(serializeMapDocument(document)).document,
    terrainSemantics: validated,
  } satisfies SerializedMapDocumentV2, null, 2);
}

export function parseMapDocumentV2(
  value: string | unknown,
  requestedMapId?: string,
): ParsedMapDocumentV2 {
  const payload: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid map document v2 payload");
  }
  const candidate = payload as Record<string, unknown>;
  if (candidate.schema !== MAP_DOCUMENT_V2_SCHEMA) {
    throw new Error("Unsupported map document schema");
  }
  if (candidate.version !== MAP_DOCUMENT_V2_VERSION) {
    throw new Error("Unsupported map document version");
  }
  if (!candidate.document || typeof candidate.document !== "object") {
    throw new Error("Missing map document");
  }
  const document = parseMapDocument({
    schema: "vandrith.map-document",
    version: 1,
    document: candidate.document,
  } as never, requestedMapId);
  const terrainSemantics = validateTerrainSemantics(
    document.width,
    document.height,
    candidate.terrainSemantics,
  );
  return { document, terrainSemantics };
}

/** Parse either supported envelope without upgrading legacy data implicitly. */
export function parseMapDocumentEnvelope(
  value: string | unknown,
  requestedMapId?: string,
): ParsedMapDocumentV2 | { document: MapDocument; terrainSemantics: null } {
  const payload: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid map document payload");
  }
  const candidate = payload as Record<string, unknown>;
  if (candidate.version === MAP_DOCUMENT_V2_VERSION) {
    return parseMapDocumentV2(candidate, requestedMapId);
  }
  if (candidate.version === 1) {
    return {
      document: parseMapDocument(candidate as never, requestedMapId),
      terrainSemantics: null,
    };
  }
  throw new Error("Unsupported map document version");
}

export const TERRAIN_SEMANTICS_V2_SCHEMA = TERRAIN_SEMANTICS_SCHEMA;
export const TERRAIN_SEMANTICS_V2_VERSION = TERRAIN_SEMANTICS_VERSION;
