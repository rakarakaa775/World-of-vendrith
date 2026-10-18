import type { MapDocument, MapParentBounds } from './map-document';

export type ChildMapSeed = {
  id: string;
  name: string;
  mapType: 'region' | 'playable';
  parentMapId: string;
  seedKey: string;
  parentBounds: MapParentBounds;
};
export type RegionSeedGroup = { region: ChildMapSeed; playables: ChildMapSeed[] };
export type WorldExpansionPlan = { worldId: string; regions: RegionSeedGroup[] };

/**
 * Builds a deterministic, non-mutating 1 World -> 4 Region -> 16 Playable plan.
 * This describes proposed children only; persistence and actual creation are
 * intentionally left to the caller so planning cannot silently overwrite maps.
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
      const region: ChildMapSeed = {
        id: regionId, name: `Region ${rx + 1}-${ry + 1}`, mapType: 'region',
        parentMapId: world.id, seedKey: `${world.id}/region/${rx}-${ry}`,
        parentBounds: { x: sx.start, y: sy.start, width: sx.length, height: sy.length },
      };
      const playables: ChildMapSeed[] = [];
      for (let py = 0; py < 2; py += 1) {
        for (let px = 0; px < 2; px += 1) {
          const psx = split(sx.length, px);
          const psy = split(sy.length, py);
          playables.push({
            id: `${regionId}:playable:${px}-${py}`,
            name: `Playable ${px + 1}-${py + 1}`, mapType: 'playable',
            parentMapId: regionId, seedKey: `${region.seedKey}/playable/${px}-${py}`,
            parentBounds: { x: psx.start, y: psy.start, width: psx.length, height: psy.length },
          });
        }
      }
      regions.push({ region, playables });
    }
  }
  return { worldId: world.id, regions };
}
