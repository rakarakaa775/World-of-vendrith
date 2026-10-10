import { describe, expect, it } from 'vitest';
import { createMap } from './map-document';
import { assertSlotWorldMatchesCanonicalVersion, parseGameSaveSnapshot, parseGameSaveSlotSnapshot, reconcileGameSaveSlotMaps, resolveAuthoritativeWorldForSlot, serializeGameSaveSnapshot } from './game-save';

function map(id: string, mapType: 'world' | 'playable' = 'world') {
  const document = createMap(mapType);
  document.id = id;
  document.name = id;
  return document;
}

describe('game save contract', () => {
  it('round-trips a world-only save snapshot', () => {
    const world = map('world-1');
    const snapshot = serializeGameSaveSnapshot(world, null);

    expect(parseGameSaveSnapshot(snapshot)).toEqual(snapshot);
  });

  it('round-trips a world + exterior save snapshot', () => {
    const world = map('world-1');
    const exterior = map('exterior-1', 'playable');
    const snapshot = serializeGameSaveSnapshot(world, exterior);

    expect(parseGameSaveSnapshot(snapshot)).toEqual(snapshot);
  });

  it('preserves the World + Exterior pair across a Save → Load → Save round trip', () => {
    const world = map('world-round-trip');
    world.name = 'Round-trip World';
    const exterior = map('exterior-round-trip', 'playable');
    exterior.name = 'Round-trip Exterior';
    exterior.layers[0].cells[0] = { tileId: 'sand' };

    // First save, then use the same strict parser that gates active Load Slot.
    const firstSave = serializeGameSaveSnapshot(world, exterior);
    const loaded = parseGameSaveSlotSnapshot(firstSave, world.id);

    // Save the loaded documents again, as the editor does after a successful load.
    const secondSave = serializeGameSaveSnapshot(loaded.world, loaded.exterior);
    const restored = parseGameSaveSlotSnapshot(secondSave, world.id);

    expect(restored.world).toEqual(world);
    expect(restored.exterior).toEqual(exterior);
    expect(restored.format).toBe('game-save-v1');
  });

  it('rejects a slot snapshot with an invalid world document', () => {
    const snapshot = {
      schema: 'vandrith.game-save',
      version: 1,
      world: { id: 'world-1', mapType: 'world', width: 2, height: 2 },
      exterior: null,
    };

    expect(parseGameSaveSnapshot(snapshot)).toBeNull();
  });

  it('rejects a slot snapshot with an invalid exterior document', () => {
    const snapshot = {
      schema: 'vandrith.game-save',
      version: 1,
      world: map('world-1'),
      exterior: { id: 'exterior-1', mapType: 'playable', width: 2, height: 2 },
    };

    expect(parseGameSaveSnapshot(snapshot)).toBeNull();
  });

  it('rejects an unsupported save schema or version', () => {
    const world = map('world-1');

    expect(parseGameSaveSnapshot({
      schema: 'other.save',
      version: 1,
      world,
      exterior: null,
    })).toBeNull();

    expect(parseGameSaveSnapshot({
      schema: 'vandrith.game-save',
      version: 2,
      world,
      exterior: null,
    })).toBeNull();
  });
});


describe('game save slot loading contract', () => {
  const worldId = 'world-1';

  it('accepts a valid combined world and exterior slot snapshot', () => {
    const world = map(worldId);
    const exterior = map('exterior-1', 'playable');
    const snapshot = serializeGameSaveSnapshot(world, exterior);

    expect(parseGameSaveSlotSnapshot(snapshot, worldId)).toEqual({
      format: 'game-save-v1',
      world,
      exterior,
    });
  });

  it('accepts a legacy single-map world snapshot without fabricating an exterior', () => {
    const world = map(worldId);
    const legacy = {
      schema: 'vandrith.map-document',
      version: 1,
      document: world,
    };

    expect(parseGameSaveSlotSnapshot(legacy, worldId)).toEqual({
      format: 'legacy-map-document-v1',
      world,
      exterior: null,
    });
  });

  it('rejects a world snapshot whose identity or map type is wrong', () => {
    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(map('other-world'), null), worldId))
      .toThrow('LOAD_SLOT_IDENTITY_MISMATCH: World snapshot id does not match authoritative map');

    const region = map(worldId);
    region.mapType = 'region';
    region.parentMapId = 'parent-world';
    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(region, null), worldId))
      .toThrow('LOAD_SLOT_IDENTITY_MISMATCH: World snapshot is not a World Map');
  });

  it('rejects an interior map where an exterior is required', () => {
    const world = map(worldId);
    const interior = createMap('playable', worldId, 'interior', worldId);
    interior.id = 'interior-1';

    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(world, interior), worldId))
      .toThrow('LOAD_SLOT_IDENTITY_MISMATCH: Exterior snapshot is not an exterior playable map');
  });

  it('rejects malformed and unsupported slot snapshots', () => {
    expect(() => parseGameSaveSlotSnapshot(null, worldId))
      .toThrow('Save Slot snapshot must be an object');
    expect(() => parseGameSaveSlotSnapshot({ schema: 'vandrith.game-save', version: 2 }, worldId))
      .toThrow('Unsupported Game Save snapshot version');
    expect(() => parseGameSaveSlotSnapshot(serializeGameSaveSnapshot(map(worldId), null), ''))
      .toThrow('Expected authoritative World Map ID is required');
  });
});


describe('game save slot map reconciliation', () => {
  it('removes stale world and exterior maps when loading a legacy world-only slot', () => {
    const currentWorld = map('world-current');
    const staleExterior = map('exterior-stale', 'playable');
    const region = map('region-keep');
    region.mapType = 'region';
    region.parentMapId = 'world-current';
    const interior = createMap('playable', 'world-current', 'interior', 'building-1');
    interior.id = 'interior-keep';

    const restoredWorld = map('world-restored');
    expect(reconcileGameSaveSlotMaps(
      [currentWorld, staleExterior, region, interior],
      restoredWorld,
      null,
    )).toEqual([region, interior, restoredWorld]);
  });

  it('replaces the previous exterior with the slot exterior while retaining unrelated map categories', () => {
    const staleExterior = map('exterior-stale', 'playable');
    const region = map('region-keep');
    region.mapType = 'region';
    const restoredWorld = map('world-restored');
    const restoredExterior = map('exterior-restored', 'playable');

    expect(reconcileGameSaveSlotMaps(
      [staleExterior, region],
      restoredWorld,
      restoredExterior,
    )).toEqual([region, restoredWorld, restoredExterior]);
  });
});


describe('authoritative World selection for Save Slot', () => {
  it('does not adopt an unrelated active World Map as the authoritative World', () => {
    const unrelated = map('new-world-created-locally');
    expect(resolveAuthoritativeWorldForSlot([unrelated], unrelated, 'canonical-world')).toBeNull();
  });

  it('selects the active document only when its identity is already authoritative', () => {
    const canonical = map('canonical-world');
    const unrelated = map('unrelated-world');
    expect(resolveAuthoritativeWorldForSlot([canonical, unrelated], canonical, 'canonical-world')).toBe(canonical);
    expect(resolveAuthoritativeWorldForSlot([canonical, unrelated], unrelated, 'canonical-world')).toBe(canonical);
  });
});


describe('Save Slot canonical World version integrity', () => {
  const world = map('canonical-world');
  const valid = {
    slotWorld: world,
    canonicalWorld: world,
    slotVersionId: 'version-row-1',
    canonicalVersionId: 'version-row-1',
    slotVersionNumber: 7,
    canonicalVersionNumber: 7,
  };

  it('accepts a slot whose World snapshot and version reference match', () => {
    expect(() => assertSlotWorldMatchesCanonicalVersion(valid)).not.toThrow();
  });

  it('compares snapshot content independent of JSON object key order', () => {
    const reorderedWorld = Object.fromEntries(Object.entries(world).reverse()) as typeof world;
    expect(() => assertSlotWorldMatchesCanonicalVersion({ ...valid, slotWorld: reorderedWorld })).not.toThrow();
  });

  it('rejects missing or inconsistent version identity', () => {
    expect(() => assertSlotWorldMatchesCanonicalVersion({ ...valid, slotVersionId: null }))
      .toThrow('LOAD_SLOT_VERSION_MISMATCH');
    expect(() => assertSlotWorldMatchesCanonicalVersion({ ...valid, canonicalVersionNumber: 6 }))
      .toThrow('LOAD_SLOT_VERSION_MISMATCH');
  });

  it('rejects a slot World snapshot that differs from its canonical version', () => {
    const editedWorld = { ...map('canonical-world'), name: 'Modified slot world' };
    expect(() => assertSlotWorldMatchesCanonicalVersion({ ...valid, slotWorld: editedWorld }))
      .toThrow('LOAD_SLOT_SNAPSHOT_MISMATCH');
  });
});
