import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { prepareAtomicGameSaveSlot } from './game-save-slot-atomic-workflow';

const WORLD_ID = '11111111-1111-1111-1111-111111111111';
const EXTERIOR_ID = '22222222-2222-2222-2222-222222222222';

function world(name: string) {
  return { ...createMap('world', null, 'exterior', null, 1, 1), id: WORLD_ID, name };
}

function exterior(name: string) {
  return { ...createMap('playable', null, 'exterior', null, 1, 1), id: EXTERIOR_ID, name };
}

describe('prepareAtomicGameSaveSlot', () => {
  it('prepares one combined World + Exterior request without performing writes', () => {
    const prepared = prepareAtomicGameSaveSlot({
      worldMapId: WORLD_ID,
      expectedWorldVersion: 7,
      remoteWorldDocument: world('Remote World'),
      localWorldDocument: world('Local World'),
      exteriorMapId: EXTERIOR_ID,
      expectedExteriorVersion: 3,
      remoteExteriorDocument: exterior('Remote Exterior'),
      localExteriorDocument: exterior('Local Exterior'),
      slotNumber: 2,
      label: 'Checkpoint',
    });

    expect(prepared.request.worldSnapshot).toMatchObject({
      schema: 'vandrith.map-document',
      version: 1,
      document: { id: WORLD_ID, mapType: 'world', name: 'Local World' },
    });
    expect(prepared.request.exteriorSnapshot).toMatchObject({
      schema: 'vandrith.map-document',
      version: 1,
      document: { id: EXTERIOR_ID, mapType: 'playable', name: 'Local Exterior' },
    });
    expect(prepared.request.slotSnapshot).toMatchObject({
      schema: 'vandrith.game-save',
      version: 1,
      world: { id: WORLD_ID, name: 'Local World' },
      exterior: { id: EXTERIOR_ID, name: 'Local Exterior' },
    });
    expect(prepared.request.expectedWorldVersion).toBe(7);
    expect(prepared.request.expectedExteriorVersion).toBe(3);
  });

  it('prepares a World-only legacy-compatible snapshot with explicit null Exterior', () => {
    const prepared = prepareAtomicGameSaveSlot({
      worldMapId: WORLD_ID,
      expectedWorldVersion: 1,
      remoteWorldDocument: world('World'),
      localWorldDocument: null,
      exteriorMapId: null,
      expectedExteriorVersion: null,
      remoteExteriorDocument: null,
      localExteriorDocument: null,
      slotNumber: 1,
      label: 'World only',
    });

    expect(prepared.request.exteriorMapId).toBeNull();
    expect(prepared.request.exteriorSnapshot).toBeNull();
    expect(prepared.request.expectedExteriorVersion).toBeNull();
    expect(prepared.request.slotSnapshot).toMatchObject({ exterior: null });
  });

  it('rejects an Exterior document that does not match the persisted identity', () => {
    expect(() => prepareAtomicGameSaveSlot({
      worldMapId: WORLD_ID,
      expectedWorldVersion: 1,
      remoteWorldDocument: world('World'),
      localWorldDocument: null,
      exteriorMapId: EXTERIOR_ID,
      expectedExteriorVersion: 0,
      remoteExteriorDocument: null,
      localExteriorDocument: { ...exterior('Wrong ID'), id: 'playable-local-only' },
      slotNumber: 1,
      label: 'Invalid',
    })).toThrow('ATOMIC_SAVE_INVALID: local Exterior document does not match its persisted Playable identity');
  });

  it('rejects a local World document that is not the authoritative World identity', () => {
    expect(() => prepareAtomicGameSaveSlot({
      worldMapId: WORLD_ID,
      expectedWorldVersion: 1,
      remoteWorldDocument: world('World'),
      localWorldDocument: { ...world('Wrong World'), id: 'world-local-only' },
      exteriorMapId: null,
      expectedExteriorVersion: null,
      remoteExteriorDocument: null,
      localExteriorDocument: null,
      slotNumber: 1,
      label: 'Invalid',
    })).toThrow('ATOMIC_SAVE_INVALID: local World identity does not match the authoritative map');
  });
});
