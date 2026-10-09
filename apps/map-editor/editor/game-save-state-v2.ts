import type { MapEditorState } from "./map-editor-state-v2";
import { parseMapEditorState, serializeInitializedMapEditorState } from "./map-editor-state-v2";
import { parseGameSaveSnapshot } from "./game-save";
import { serializeMapDocument } from "./map-serialization";

export const GAME_SAVE_STATE_V2_SCHEMA = "vandrith.game-save" as const;
export const GAME_SAVE_STATE_V2_VERSION = 2 as const;

export type GameSaveStateV2 = Readonly<{
  schema: typeof GAME_SAVE_STATE_V2_SCHEMA;
  version: typeof GAME_SAVE_STATE_V2_VERSION;
  world: MapEditorState;
  exterior: MapEditorState | null;
}>;

function mapStatePayload(state: MapEditorState): unknown {
  // Canonicalize legacy and initialized states through the same parser before
  // emitting the save envelope. serializeMapDocument alone is not a validator.
  const json = state.kind === "initialized"
    ? serializeInitializedMapEditorState(state)
    : serializeMapDocument(state.document);
  const canonical = parseMapEditorState(json);
  const canonicalJson = canonical.kind === "initialized"
    ? serializeInitializedMapEditorState(canonical)
    : serializeMapDocument(canonical.document);
  return JSON.parse(canonicalJson) as unknown;
}

function isValidPair(world: MapEditorState, exterior: MapEditorState | null): boolean {
  return world.document.mapType === "world" &&
    (!exterior || (exterior.document.mapType === "playable" && exterior.document.playableSpace === "exterior"));
}

export function serializeGameSaveStateV2(
  world: MapEditorState,
  exterior: MapEditorState | null,
): string {
  if (!isValidPair(world, exterior)) throw new Error("Game save map types are invalid");
  return JSON.stringify({
    schema: GAME_SAVE_STATE_V2_SCHEMA,
    version: GAME_SAVE_STATE_V2_VERSION,
    world: mapStatePayload(world),
    exterior: exterior ? mapStatePayload(exterior) : null,
  }, null, 2);
}

/** Parse the whole save atomically; legacy v1 saves never receive inferred semantics. */
export function parseGameSaveStateV2(input: unknown): GameSaveStateV2 | null {
  try {
    const value: unknown = typeof input === "string" ? JSON.parse(input) : input;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const envelope = value as Record<string, unknown>;
    if (envelope.schema !== GAME_SAVE_STATE_V2_SCHEMA) return null;

    if (envelope.version === 1) {
      const legacy = parseGameSaveSnapshot(value);
      if (!legacy) return null;
      const world = parseMapEditorState(serializeMapDocument(legacy.world));
      const exterior = legacy.exterior ? parseMapEditorState(serializeMapDocument(legacy.exterior)) : null;
      if (!isValidPair(world, exterior)) return null;
      return { schema: GAME_SAVE_STATE_V2_SCHEMA, version: GAME_SAVE_STATE_V2_VERSION, world, exterior };
    }

    if (envelope.version !== GAME_SAVE_STATE_V2_VERSION ||
        !("world" in envelope) || !("exterior" in envelope)) return null;
    const world = parseMapEditorState(envelope.world);
    const exterior = envelope.exterior === null ? null : parseMapEditorState(envelope.exterior);
    if (!isValidPair(world, exterior)) return null;
    return { schema: GAME_SAVE_STATE_V2_SCHEMA, version: GAME_SAVE_STATE_V2_VERSION, world, exterior };
  } catch {
    return null;
  }
}

/** Enforce the caller's authoritative world identity after atomic envelope parsing. */
export function parseGameSaveStateV2ForWorld(
  input: unknown,
  expectedWorldId: string,
): GameSaveStateV2 | null {
  if (!expectedWorldId.trim()) return null;
  const parsed = parseGameSaveStateV2(input);
  return parsed && parsed.world.document.id === expectedWorldId ? parsed : null;
}
