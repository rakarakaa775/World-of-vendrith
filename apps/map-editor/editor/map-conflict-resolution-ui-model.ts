import type { MapMergeResult, MergeConflict } from './map-entity-merge';

export type ConflictChoice = 'local' | 'remote' | 'base';
export type ConflictView = MergeConflict & { choice: ConflictChoice | null };
export type ConflictResolutionSession = { conflicts: ConflictView[]; selected: number };

export function createConflictResolutionSession(result: MapMergeResult): ConflictResolutionSession {
  return { conflicts: result.conflicts.map(c => ({ ...c, choice: null })), selected: 0 };
}

export function chooseConflict(session: ConflictResolutionSession, id: string, choice: ConflictChoice): ConflictResolutionSession {
  return { ...session, conflicts: session.conflicts.map(c => c.id === id ? { ...c, choice } : c) };
}

export function resolveAll(session: ConflictResolutionSession, choice: ConflictChoice): ConflictResolutionSession {
  return { ...session, conflicts: session.conflicts.map(c => ({ ...c, choice })) };
}

export function canApplyResolution(session: ConflictResolutionSession): boolean {
  return session.conflicts.every(c => c.choice !== null);
}
