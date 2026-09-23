import type { MapDocument } from './map-document';

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
    const candidate = value as any;
    if (candidate.schema !== 'vandrith.game-save' || candidate.version !== 1 || !candidate.world) return null;
    return {
      schema: 'vandrith.game-save',
      version: 1,
      world: candidate.world as MapDocument,
      exterior: candidate.exterior && typeof candidate.exterior === 'object' ? candidate.exterior as MapDocument : null,
    };
  } catch {
    return null;
  }
}
