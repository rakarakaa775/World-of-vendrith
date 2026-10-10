import type { MapDocument } from './map-document';
import { parseMapDocument } from './map-serialization';

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
    if (!Object.prototype.hasOwnProperty.call(candidate, 'world')
        || !Object.prototype.hasOwnProperty.call(candidate, 'exterior')
        || (candidate.exterior !== null && typeof candidate.exterior !== 'object')) {
      throw new Error('Game Save snapshot is incomplete');
    }
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


/**
 * Reconcile the editor's open-map list with a loaded Game Save slot.
 * A slot is authoritative for the World Map and its exterior: stale world
 * and exterior documents must not survive a load, especially for legacy
 * world-only slots. Other map categories (regions and interiors) are retained.
 */
export function reconcileGameSaveSlotMaps(
  existing: MapDocument[],
  world: MapDocument,
  exterior: MapDocument | null,
): MapDocument[] {
  const retained = existing.filter((document) =>
    document.mapType !== 'world'
    && !(document.mapType === 'playable' && (document.playableSpace ?? 'exterior') === 'exterior'),
  );
  return exterior ? [...retained, world, exterior] : [...retained, world];
}


/**
 * Select only the document that already has the authoritative World Map identity.
 * A different open World Map must never be relabeled and saved over the authority.
 */
export function resolveAuthoritativeWorldForSlot(
  maps: MapDocument[],
  active: MapDocument,
  expectedWorldId: string,
): MapDocument | null {
  if (active.mapType === 'world' && active.id === expectedWorldId) return active;
  return maps.find((document) => document.mapType === 'world' && document.id === expectedWorldId) ?? null;
}


/**
 * Fail closed when a slot's World snapshot is not tied to the canonical version
 * row returned by the persistence layer.
 */
function stableJson(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === 'object') {
      return Object.fromEntries(
        Object.entries(item as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, child]) => [key, normalize(child)]),
      );
    }
    return item;
  };
  return JSON.stringify(normalize(value));
}

export function assertSlotWorldMatchesCanonicalVersion(input: {
  slotWorld: MapDocument;
  canonicalWorld: MapDocument;
  slotVersionId: string | null | undefined;
  canonicalVersionId: string | null | undefined;
  slotVersionNumber: number;
  canonicalVersionNumber: number;
}): void {
  if (!input.slotVersionId || input.slotVersionId !== input.canonicalVersionId) {
    throw new Error('LOAD_SLOT_VERSION_MISMATCH: referenced World version id is missing or inconsistent');
  }
  if (!Number.isInteger(input.slotVersionNumber) || input.slotVersionNumber < 1
      || input.slotVersionNumber !== input.canonicalVersionNumber) {
    throw new Error('LOAD_SLOT_VERSION_MISMATCH: referenced World version number is inconsistent');
  }
  if (input.slotWorld.id !== input.canonicalWorld.id
      || stableJson(input.slotWorld) !== stableJson(input.canonicalWorld)) {
    throw new Error('LOAD_SLOT_SNAPSHOT_MISMATCH: slot World snapshot differs from canonical version');
  }
}
