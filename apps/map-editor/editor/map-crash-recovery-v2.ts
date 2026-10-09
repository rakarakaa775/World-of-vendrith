import type { MapDocumentV2State } from "./map-history-v2";
import { parseMapSnapshot, serializeMapDocumentV2 } from "./map-snapshot-v2";

/** Minimal Storage-compatible surface, injectable for deterministic tests. */
export type MapV2RecoveryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type MapV2RecoveryEntry = {
  mapId: string;
  savedAt: string;
  snapshot: string;
};

export type MapV2CrashRecoveryJournal = {
  write(state: MapDocumentV2State): void;
  read(mapId: string): MapDocumentV2State | null;
  clear(mapId: string): void;
  has(mapId: string): boolean;
};

/**
 * Opt-in recovery journal for combined document + terrain semantics snapshots.
 * This is intentionally separate from the existing v1 journal until the
 * editor's live state and recovery UX are migrated as one audited change.
 */
export function createMapV2CrashRecoveryJournal(
  storage: MapV2RecoveryStorage = globalThis.localStorage,
  keyPrefix = "vandrith.map-editor.recovery.v2",
): MapV2CrashRecoveryJournal {
  const keyFor = (mapId: string) => `${keyPrefix}.${mapId}`;

  return {
    write(state) {
      const entry: MapV2RecoveryEntry = {
        mapId: state.document.id,
        savedAt: new Date().toISOString(),
        snapshot: serializeMapDocumentV2(state),
      };
      storage.setItem(keyFor(state.document.id), JSON.stringify(entry));
    },
    read(mapId) {
      const raw = storage.getItem(keyFor(mapId));
      if (!raw) return null;
      try {
        const entry: unknown = JSON.parse(raw);
        if (!entry || typeof entry !== "object") return null;
        const candidate = entry as Partial<MapV2RecoveryEntry>;
        if (
          candidate.mapId !== mapId ||
          typeof candidate.savedAt !== "string" ||
          typeof candidate.snapshot !== "string"
        ) return null;
        const parsed = parseMapSnapshot(candidate.snapshot, mapId);
        return parsed.format === "v2" ? parsed.state : null;
      } catch {
        return null;
      }
    },
    clear(mapId) {
      storage.removeItem(keyFor(mapId));
    },
    has(mapId) {
      return storage.getItem(keyFor(mapId)) !== null;
    },
  };
}
