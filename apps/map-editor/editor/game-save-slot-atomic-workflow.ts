import type { MapDocument } from './map-document';
import { mergeMapDocumentsThreeWay } from './map-entity-merge';
import { serializeGameSaveSnapshot } from './game-save';
import { serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';
import { parseMapDocument } from './map-serialization';
import { assertTerrainPreserved, traceTerrain } from './map-save-trace';
import type { AtomicGameSaveSlotRequest } from './game-save-slot-atomic-client';

export type PrepareAtomicGameSaveSlotInput = {
  worldMapId: string;
  expectedWorldVersion: number;
  remoteWorldDocument: MapDocument;
  localWorldDocument: MapDocument | null;
  exteriorMapId: string | null;
  expectedExteriorVersion: number | null;
  remoteExteriorDocument: MapDocument | null;
  localExteriorDocument: MapDocument | null;
  slotNumber: number;
  label: string;
};

export type PreparedAtomicGameSaveSlot = {
  request: AtomicGameSaveSlotRequest;
  worldDocument: MapDocument;
  exteriorDocument: MapDocument | null;
};

/**
 * Prepare snapshots without performing any persistence writes.
 * The RPC must be the only writer for the Save Slot operation.
 */
export function prepareAtomicGameSaveSlot(
  input: PrepareAtomicGameSaveSlotInput,
): PreparedAtomicGameSaveSlot {
  if (input.remoteWorldDocument.id !== input.worldMapId || input.remoteWorldDocument.mapType !== 'world') {
    throw new Error('ATOMIC_SAVE_INVALID: remote World identity does not match the authoritative map');
  }
  if (input.localWorldDocument && input.localWorldDocument.id !== input.worldMapId) {
    throw new Error('ATOMIC_SAVE_INVALID: local World identity does not match the authoritative map');
  }
  if (input.exteriorMapId === null) {
    if (input.localExteriorDocument || input.remoteExteriorDocument || input.expectedExteriorVersion !== null) {
      throw new Error('ATOMIC_SAVE_INVALID: Exterior documents/version require an Exterior identity');
    }
  } else {
    if (!input.localExteriorDocument || input.localExteriorDocument.id !== input.exteriorMapId
      || input.localExteriorDocument.mapType !== 'playable'
      || (input.localExteriorDocument.playableSpace ?? 'exterior') !== 'exterior') {
      throw new Error('ATOMIC_SAVE_INVALID: local Exterior document does not match its persisted Playable identity');
    }
    if (input.expectedExteriorVersion === null || !Number.isInteger(input.expectedExteriorVersion)
      || input.expectedExteriorVersion < 0) {
      throw new Error('ATOMIC_SAVE_INVALID: expected Exterior version is required');
    }
    if (input.remoteExteriorDocument && input.remoteExteriorDocument.id !== input.exteriorMapId) {
      throw new Error('ATOMIC_SAVE_INVALID: remote Exterior identity mismatch');
    }
  }

  const localWorld = input.localWorldDocument ?? input.remoteWorldDocument;
  const worldMerge = mergeMapDocumentsThreeWay(input.remoteWorldDocument, localWorld, input.remoteWorldDocument);
  if (worldMerge.conflicts.length > 0) {
    throw new Error('ATOMIC_SAVE_WORLD_MERGE_CONFLICT');
  }
  const worldDocument = worldMerge.document;
  const worldSnapshot = serializeResolvedMapSnapshot(worldDocument);
  const worldRoundTrip = parseMapDocument(JSON.stringify(worldSnapshot), input.worldMapId);
  assertTerrainPreserved(traceTerrain(worldDocument, 'atomic-world-prepared'), traceTerrain(worldRoundTrip, 'atomic-world-serialized'), 'atomic World serialization');

  let exteriorDocument: MapDocument | null = null;
  let exteriorSnapshot: Record<string, unknown> | null = null;
  if (input.exteriorMapId !== null && input.localExteriorDocument) {
    const remoteExterior = input.remoteExteriorDocument ?? input.localExteriorDocument;
    const exteriorMerge = mergeMapDocumentsThreeWay(remoteExterior, input.localExteriorDocument, remoteExterior);
    if (exteriorMerge.conflicts.length > 0) {
      throw new Error('ATOMIC_SAVE_EXTERIOR_MERGE_CONFLICT');
    }
    exteriorDocument = exteriorMerge.document;
    exteriorSnapshot = serializeResolvedMapSnapshot(exteriorDocument);
    const exteriorRoundTrip = parseMapDocument(JSON.stringify(exteriorSnapshot), input.exteriorMapId);
    assertTerrainPreserved(traceTerrain(exteriorDocument, 'atomic-exterior-prepared'), traceTerrain(exteriorRoundTrip, 'atomic-exterior-serialized'), 'atomic Exterior serialization');
  }

  const request: AtomicGameSaveSlotRequest = {
    worldMapId: input.worldMapId,
    expectedWorldVersion: input.expectedWorldVersion,
    worldSnapshot,
    exteriorMapId: input.exteriorMapId,
    expectedExteriorVersion: input.exteriorMapId === null ? null : input.expectedExteriorVersion,
    exteriorSnapshot,
    slotNumber: input.slotNumber,
    label: input.label,
    slotSnapshot: serializeGameSaveSnapshot(worldDocument, exteriorDocument) as unknown as Record<string, unknown>,
  };

  return { request, worldDocument, exteriorDocument };
}
