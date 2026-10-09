/**
 * Pure gameplay traversal policy for water cells.
 *
 * This is deliberately separate from editor water-band rendering and does not
 * read or write MapDocument, map_cells, or runtime persistence.
 */
export type WaterFeature = 'shoreline' | 'river' | 'lake' | 'waterfall' | 'ocean_sea' | 'none';
export type WaterDepth = 'shallow' | 'medium' | 'deep' | 'unknown';
export type WaterCurrent = 'calm' | 'moderate' | 'strong' | 'unknown';

export type WaterTraversalCell = Readonly<{
  surface: 'land' | 'water';
  feature?: WaterFeature;
  depth?: WaterDepth;
  current?: WaterCurrent;
  /** Explicitly authored: ordinary walking may enter this shallow-water cell. */
  shallowWalkable?: boolean;
  /** A bridge is a valid crossing independent of swimming capability. */
  bridge?: boolean;
  /** A validated crossing point, e.g. ford or designated transition. */
  crossingPoint?: boolean;
}>;

export type WaterTraversalActor = Readonly<{
  canSwim?: boolean;
  hasWaterTransport?: boolean;
}>;

export type WaterTraversalDecision =
  | 'walk'
  | 'swim'
  | 'water_transport'
  | 'blocked';

export function resolveWaterTraversal(
  cell: WaterTraversalCell,
  actor: WaterTraversalActor,
): WaterTraversalDecision {
  if (cell.surface === 'land') return 'walk';

  // A water cell with no semantic feature is not silently treated as land.
  if (!cell.feature || cell.feature === 'none') return 'blocked';

  // Deep ocean/sea is always a transport domain. A generic crossing-point
  // flag must not accidentally turn open ocean into walkable terrain.
  if (cell.feature === 'ocean_sea' && cell.depth === 'deep') {
    return actor.hasWaterTransport === true ? 'water_transport' : 'blocked';
  }

  // Explicit bridges/crossings can bypass ordinary wading rules in non-ocean
  // water; the author is responsible for marking only validated crossings.
  if (cell.bridge === true || cell.crossingPoint === true) return 'walk';

  if (cell.feature === 'shoreline' && cell.depth === 'shallow' && cell.shallowWalkable === true) {
    return 'walk';
  }

  // River current must be known and non-dangerous before wading or swimming.
  if (cell.feature === 'river') {
    const safeCurrent = cell.current === 'calm' || cell.current === 'moderate';
    if (!safeCurrent) return 'blocked';
    if (cell.depth === 'shallow' && cell.shallowWalkable === true) return 'walk';
    if (cell.depth !== 'deep' && cell.depth !== 'unknown' && actor.canSwim === true) {
      return 'swim';
    }
    return 'blocked';
  }

  // Swimming is capability-gated for non-deep water. Unknown depth is not
  // assumed safe, and the deep-ocean rule above always requires transport.
  if (cell.depth !== 'deep' && cell.depth !== 'unknown' && actor.canSwim === true) {
    return 'swim';
  }

  return 'blocked';
}
