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
