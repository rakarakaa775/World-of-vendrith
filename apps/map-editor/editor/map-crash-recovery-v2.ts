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

  function readState(mapId: string): MapDocumentV2State | null {
    try {
      // Storage can throw in restricted/private browsing contexts. Recovery
      // reads must fail closed instead of preventing the editor from opening.
      const raw = storage.getItem(keyFor(mapId));
      if (!raw) return null;
      const entry: unknown = JSON.parse(raw);
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      const candidate = entry as Partial<MapV2RecoveryEntry>;
      if (
        candidate.mapId !== mapId ||
        typeof candidate.savedAt !== "string" ||
        !Number.isFinite(Date.parse(candidate.savedAt)) ||
        typeof candidate.snapshot !== "string"
      ) return null;
      const parsed = parseMapSnapshot(candidate.snapshot, mapId);
      return parsed.format === "v2" ? parsed.state : null;
    } catch {
      return null;
    }
  }

  return {
    write(state) {
      const entry: MapV2RecoveryEntry = {
        mapId: state.document.id,
        savedAt: new Date().toISOString(),
        snapshot: serializeMapDocumentV2(state),
      };
      storage.setItem(keyFor(state.document.id), JSON.stringify(entry));
    },
    read: readState,
    clear(mapId) {
      storage.removeItem(keyFor(mapId));
    },
    has(mapId) {
      // "Has recovery" means a valid, readable v2 recovery—not merely a key
      // left behind by a crash or malformed local storage entry.
      return readState(mapId) !== null;
    },
  };
}
