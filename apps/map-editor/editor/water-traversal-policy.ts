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
  if (cell.surface === 'land' || cell.feature === 'none') return 'walk';

  // Explicit structures and authored crossing points take priority over water.
  if (cell.bridge === true || cell.crossingPoint === true) return 'walk';

  if (cell.feature === 'shoreline' && cell.depth === 'shallow' && cell.shallowWalkable === true) {
    return 'walk';
  }

  // Deep ocean/sea is a transport domain, not a swimming shortcut.
  if (cell.feature === 'ocean_sea' && cell.depth === 'deep') {
    return actor.hasWaterTransport === true ? 'water_transport' : 'blocked';
  }

  // Rivers require an explicit safe crossing, wading designation, or safe swim.
  if (cell.feature === 'river') {
    if (cell.depth === 'shallow' && cell.shallowWalkable === true &&
        cell.current !== 'strong' && cell.current !== 'unknown') {
      return 'walk';
    }
    if (cell.depth !== 'deep' && cell.current !== 'strong' &&
        cell.current !== 'unknown' && actor.canSwim === true) {
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
