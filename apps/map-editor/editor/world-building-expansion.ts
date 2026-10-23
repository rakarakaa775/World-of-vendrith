import { createMap, type MapDocument, type MapParentBounds, type MapLayer } from './map-document';

export type ChildMapSeed = {
  id: string;
  name: string;
  mapType: 'region' | 'playable';
  parentMapId: string;
  seedKey: string;
  parentBounds: MapParentBounds;
  width: number;
  height: number;
};
export type RegionSeedGroup = { region: ChildMapSeed; playables: ChildMapSeed[] };
export type WorldExpansionPlan = { worldId: string; regions: RegionSeedGroup[] };

/**
 * Builds a deterministic, non-mutating 1 World -> 4 Region -> 16 Playable plan.
 * Each child covers a source quadrant; its grid is scaled 2x per dimension.
 * This describes proposed children only; persistence remains the caller's responsibility.
 */
export function planWorldExpansion(world: MapDocument): WorldExpansionPlan {
  if (world.mapType !== 'world') throw new Error('WORLD_EXPANSION_REQUIRES_WORLD');
  if (!world.id.trim() || !Number.isInteger(world.width) || !Number.isInteger(world.height) ||
      world.width < 2 || world.height < 2) throw new Error('WORLD_EXPANSION_INVALID_WORLD');

  const split = (size: number, index: number): { start: number; length: number } => {
    const base = Math.floor(size / 2);
    const remainder = size % 2;
    const length = base + (index < remainder ? 1 : 0);
    const start = index * base + Math.min(index, remainder);
    return { start, length };
  };

  const regions: RegionSeedGroup[] = [];
  for (let ry = 0; ry < 2; ry += 1) {
    for (let rx = 0; rx < 2; rx += 1) {
      const sx = split(world.width, rx);
      const sy = split(world.height, ry);
      const regionId = `${world.id}:region:${rx}-${ry}`;
      const regionBounds = { x: sx.start, y: sy.start, width: sx.length, height: sy.length };
      const region: ChildMapSeed = {
        id: regionId, name: `Region ${String.fromCharCode(65 + ry * 2 + rx)}`, mapType: 'region',
        parentMapId: world.id, seedKey: `${world.id}/region/${rx}-${ry}`,
        parentBounds: regionBounds, width: sx.length * 2, height: sy.length * 2,
      };
      const playables: ChildMapSeed[] = [];
      for (let py = 0; py < 2; py += 1) {
        for (let px = 0; px < 2; px += 1) {
          const psx = split(region.width, px);
          const psy = split(region.height, py);
          playables.push({
            id: `${regionId}:playable:${px}-${py}`,
            name: `Playable ${px + 1}-${py + 1}`, mapType: 'playable',
            parentMapId: regionId, seedKey: `${region.seedKey}/playable/${px}-${py}`,
            parentBounds: { x: psx.start, y: psy.start, width: psx.length, height: psy.length },
            width: psx.length * 2, height: psy.length * 2,
          });
        }
      }
      regions.push({ region, playables });
    }
  }
  return { worldId: world.id, regions };
}


/** Materialize a planned child document and expand its source terrain cells 2x2. */
export function materializeChildMap(parent: MapDocument, seed: ChildMapSeed): MapDocument {
  if (seed.parentMapId !== parent.id) throw new Error('WORLD_EXPANSION_PARENT_MISMATCH');
  if (!Number.isInteger(seed.width) || !Number.isInteger(seed.height) || seed.width < 1 || seed.height < 1) {
    throw new Error('WORLD_EXPANSION_INVALID_CHILD_SIZE');
  }
  const b = seed.parentBounds;
  if (b.x < 0 || b.y < 0 || b.width < 1 || b.height < 1 || b.x + b.width > parent.width || b.y + b.height > parent.height) {
    throw new Error('WORLD_EXPANSION_BOUNDS_OUTSIDE_PARENT');
  }
  const child = createMap(seed.mapType, parent.id, 'exterior', null, seed.width, seed.height);
  const sourceGround = parent.layers.find(layer => layer.kind === 'ground');
  const layers: MapLayer[] = child.layers.map(layer => {
    if (layer.kind !== 'ground' || !sourceGround) return layer;
    const cells = Array.from({ length: seed.width * seed.height }, (_, index) => {
      const x = Math.floor(index % seed.width / 2) + b.x;
      const y = Math.floor(index / seed.width / 2) + b.y;
      return { tileId: sourceGround.cells[y * parent.width + x]?.tileId ?? null };
    });
    return { ...layer, cells };
  });
  return {
    ...child,
    id: seed.id,
    name: seed.name,
    parentMapId: parent.id,
    parentBounds: { ...b },
    tileSize: parent.tileSize,
    layers,
  };
}

/** Build the complete 21-map World/Region/Playable tree locally without persistence side effects. */
export function materializeWorldExpansion(world: MapDocument): MapDocument[] {
  const plan = planWorldExpansion(world);
  const maps: MapDocument[] = [];
  for (const group of plan.regions) {
    const region = materializeChildMap(world, group.region);
    maps.push(region);
    for (const seed of group.playables) maps.push(materializeChildMap(region, seed));
  }
  return maps;
}
