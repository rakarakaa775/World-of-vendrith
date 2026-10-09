import type { MapDocument } from "./map-document";
import { MAP_DOCUMENT_SCHEMA, MAP_DOCUMENT_VERSION, parseMapDocument, serializeMapDocument } from "./map-serialization";
import {
  validateTerrainSemantics,
  type TerrainSemanticsSection,
} from "./terrain-semantics";
import type { MapDocumentV2State } from "./map-history-v2";

export const MAP_DOCUMENT_V2_SCHEMA = "vandrith.map-document-v2" as const;
export const MAP_DOCUMENT_V2_VERSION = 2 as const;

type PersistedV2Envelope = {
  schema: typeof MAP_DOCUMENT_V2_SCHEMA;
  version: typeof MAP_DOCUMENT_V2_VERSION;
  document: MapDocument;
  terrainSemantics: TerrainSemanticsSection;
};

export type ParsedMapSnapshot =
  | { format: "v1"; document: MapDocument; terrainSemantics: null }
  | { format: "v2"; state: MapDocumentV2State };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Serializes the combined authoring state without changing the existing v1
 * serializer or the production persistence boundary. Callers must explicitly
 * opt into this adapter; it is not wired into the live Save action yet.
 */
export function serializeMapDocumentV2(state: MapDocumentV2State): string {
  const semantics = validateTerrainSemantics(
    state.document.width,
    state.document.height,
    state.terrainSemantics,
  );
  // Validate with the canonical v1 parser before wrapping the document in v2.
  // This ensures v2 writes preserve all existing MapDocument invariants.
  const document = parseMapDocument(serializeMapDocument(state.document));
  const envelope: PersistedV2Envelope = {
    schema: MAP_DOCUMENT_V2_SCHEMA,
    version: MAP_DOCUMENT_V2_VERSION,
    document,
    terrainSemantics: semantics,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Reads v2 combined snapshots and existing v1 snapshots. A v1 document
 * deliberately returns terrainSemantics=null: no semantics are fabricated
 * during migration. Requested map identity is enforced for both formats.
 */
export function parseMapSnapshot(
  input: string | unknown,
  requestedMapId?: string,
): ParsedMapSnapshot {
  const payload: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (!isRecord(payload)) throw new Error("Persisted map snapshot is invalid");

  if (payload.schema === MAP_DOCUMENT_V2_SCHEMA) {
    if (payload.version !== MAP_DOCUMENT_V2_VERSION) {
      throw new Error("Unsupported map document v2 version");
    }
    const document = parseMapDocument(JSON.stringify({
      schema: MAP_DOCUMENT_SCHEMA,
      version: MAP_DOCUMENT_VERSION,
      document: payload.document,
    }), requestedMapId);
    const terrainSemantics = validateTerrainSemantics(
      document.width,
      document.height,
      payload.terrainSemantics,
    );
    return { format: "v2", state: { document, terrainSemantics } };
  }

  // Delegate all legacy shapes to the existing compatibility parser.
  const document = parseMapDocument(JSON.stringify(payload), requestedMapId);
  return { format: "v1", document, terrainSemantics: null };
}
