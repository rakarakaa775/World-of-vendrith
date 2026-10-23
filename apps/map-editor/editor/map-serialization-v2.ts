import type { MapDocument } from "./map-document";
import {
  MAP_DOCUMENT_V2_SCHEMA as CANONICAL_MAP_DOCUMENT_V2_SCHEMA,
  MAP_DOCUMENT_V2_VERSION,
  parseMapSnapshot,
  serializeMapDocumentV2 as serializeCanonicalMapDocumentV2,
} from "./map-snapshot-v2";
import type { TerrainSemanticsSection } from "./terrain-semantics";

/**
 * Compatibility facade for the earlier V2 serialization API. All writes use
 * the canonical map-snapshot-v2 envelope; the earlier alternate schema name
 * is accepted only on reads so it cannot create a second persisted format.
 */
export const MAP_DOCUMENT_V2_SCHEMA = CANONICAL_MAP_DOCUMENT_V2_SCHEMA;
export { MAP_DOCUMENT_V2_VERSION };

const LEGACY_ALTERNATE_V2_SCHEMA = "vandrith.map-document";

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

function normalizeV2Envelope(value: string | unknown): unknown {
  const payload: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const candidate = payload as Record<string, unknown>;
  if (candidate.schema === LEGACY_ALTERNATE_V2_SCHEMA && candidate.version === MAP_DOCUMENT_V2_VERSION) {
    return { ...candidate, schema: CANONICAL_MAP_DOCUMENT_V2_SCHEMA };
  }
  return payload;
}

export function serializeMapDocumentV2(
  document: MapDocument,
  terrainSemantics: TerrainSemanticsSection,
): string {
  return serializeCanonicalMapDocumentV2({ document, terrainSemantics });
}

export function parseMapDocumentV2(
  value: string | unknown,
  requestedMapId?: string,
): ParsedMapDocumentV2 {
  const parsed = parseMapSnapshot(normalizeV2Envelope(value), requestedMapId);
  if (parsed.format !== "v2") throw new Error("Expected a V2 map document envelope");
  return parsed.state;
}

/** Parse the canonical V2 format and legacy V1 documents without inventing semantics. */
export function parseMapDocumentEnvelope(
  value: string | unknown,
  requestedMapId?: string,
): ParsedMapDocumentV2 | { document: MapDocument; terrainSemantics: null } {
  const parsed = parseMapSnapshot(normalizeV2Envelope(value), requestedMapId);
  return parsed.format === "v2"
    ? parsed.state
    : { document: parsed.document, terrainSemantics: null };
}

export const TERRAIN_SEMANTICS_V2_SCHEMA = "vandrith.terrain-semantics" as const;
export const TERRAIN_SEMANTICS_V2_VERSION = 1 as const;
