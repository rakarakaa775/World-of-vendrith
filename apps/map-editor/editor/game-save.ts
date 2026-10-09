import type { MapDocument } from './map-document';
import { parseMapDocument, serializeMapDocument } from './map-serialization';

export type GameSaveSnapshot = {
  schema: 'vandrith.game-save';
  version: 1;
  world: MapDocument;
  exterior: MapDocument | null;
};

export function serializeGameSaveSnapshot(world: MapDocument, exterior: MapDocument | null): GameSaveSnapshot {
  return { schema: 'vandrith.game-save', version: 1, world, exterior };
}

export type ParsedGameSaveSlotSnapshot = {
  format: 'game-save-v1' | 'legacy-map-document-v1';
  world: MapDocument;
  exterior: MapDocument | null;
};

/**
 * Parses both the current combined Game Save envelope and the older single-map
 * snapshot still present in existing Save Slots. Legacy snapshots restore only
 * the World Map; they never fabricate an Exterior Map.
 */
export function parseGameSaveSlotSnapshot(
  snapshot: unknown,
  expectedWorldId: string,
): ParsedGameSaveSlotSnapshot {
  if (typeof expectedWorldId !== 'string' || expectedWorldId.trim() === '') {
    throw new Error('Expected authoritative World Map ID is required');
  }

  const value = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Save Slot snapshot must be an object');
  }
  const candidate = value as Record<string, unknown>;

  let world: MapDocument;
  let exterior: MapDocument | null = null;
  let format: ParsedGameSaveSlotSnapshot['format'];

  if (candidate.schema === 'vandrith.game-save') {
    if (candidate.version !== 1) throw new Error('Unsupported Game Save snapshot version');
    const parsed = parseGameSaveSnapshot(candidate);
    if (!parsed) throw new Error('Game Save snapshot is invalid');
    world = parsed.world;
    exterior = parsed.exterior;
    format = 'game-save-v1';
  } else if (candidate.schema === 'vandrith.map-document' && candidate.version === 1) {
    world = parseMapDocument(value as Parameters<typeof parseMapDocument>[0], expectedWorldId);
    format = 'legacy-map-document-v1';
  } else {
    throw new Error('Unsupported Save Slot snapshot schema');
  }

  if (world.id !== expectedWorldId) {
    throw new Error('LOAD_SLOT_IDENTITY_MISMATCH: World snapshot id does not match authoritative map');
  }
  if (world.mapType !== 'world') {
    throw new Error('LOAD_SLOT_IDENTITY_MISMATCH: World snapshot is not a World Map');
  }
  if (exterior && (exterior.mapType !== 'playable' || (exterior.playableSpace ?? 'exterior') !== 'exterior')) {
    throw new Error('LOAD_SLOT_IDENTITY_MISMATCH: Exterior snapshot is not an exterior playable map');
  }

  return { format, world, exterior };
}

export function parseGameSaveSnapshot(snapshot: unknown): GameSaveSnapshot | null {
  try {
    const value = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Record<string, unknown>;
    if (candidate.schema !== 'vandrith.game-save' || candidate.version !== 1) return null;

    const world = parseMapDocument(candidate.world as MapDocument);
    let exterior: MapDocument | null = null;
    if (candidate.exterior !== null && candidate.exterior !== undefined) {
      exterior = parseMapDocument(candidate.exterior as MapDocument);
    }

    return { schema: 'vandrith.game-save', version: 1, world, exterior };
  } catch {
    return null;
  }
}
