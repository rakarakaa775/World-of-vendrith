import { describe, expect, it } from 'vitest';
import { resolveWaterTraversal } from './water-traversal-policy';

describe('resolveWaterTraversal', () => {
  it('allows ordinary walking on land', () => {
    expect(resolveWaterTraversal({ surface: 'land' }, {})).toBe('walk');
  });

  it('allows walking through only explicitly designated shallow shoreline water', () => {
    expect(resolveWaterTraversal(
      { surface: 'water', feature: 'shoreline', depth: 'shallow', shallowWalkable: true },
      {},
    )).toBe('walk');
    expect(resolveWaterTraversal(
      { surface: 'water', feature: 'shoreline', depth: 'shallow' },
      {},
    )).toBe('blocked');
  });

  it('blocks water whose gameplay feature is missing or none', () => {
    expect(resolveWaterTraversal({ surface: 'water' }, { canSwim: true })).toBe('blocked');
    expect(resolveWaterTraversal({ surface: 'water', feature: 'none' }, {})).toBe('blocked');
  });

  it('requires swimming capability for ordinary medium-depth water', () => {
    const lake = { surface: 'water' as const, feature: 'lake' as const, depth: 'medium' as const };
    expect(resolveWaterTraversal(lake, {})).toBe('blocked');
    expect(resolveWaterTraversal(lake, { canSwim: true })).toBe('swim');
  });

  it('requires water transport for deep ocean/sea even if actor can swim', () => {
    const sea = { surface: 'water' as const, feature: 'ocean_sea' as const, depth: 'deep' as const };
    expect(resolveWaterTraversal(sea, { canSwim: true })).toBe('blocked');
    expect(resolveWaterTraversal(sea, { hasWaterTransport: true })).toBe('water_transport');
  });

  it('allows river crossings over bridges or designated crossing points', () => {
    expect(resolveWaterTraversal(
      { surface: 'water', feature: 'river', depth: 'deep', current: 'strong', bridge: true },
      {},
    )).toBe('walk');
    expect(resolveWaterTraversal(
      { surface: 'water', feature: 'river', depth: 'deep', current: 'strong', crossingPoint: true },
      {},
    )).toBe('walk');
  });

  it('allows a designated shallow river ford only when depth and current are safe', () => {
    const ford = { surface: 'water' as const, feature: 'river' as const, depth: 'shallow' as const, shallowWalkable: true };
    expect(resolveWaterTraversal({ ...ford, current: 'calm' }, {})).toBe('walk');
    expect(resolveWaterTraversal({ ...ford, current: 'moderate' }, {})).toBe('walk');
    expect(resolveWaterTraversal({ ...ford, current: 'strong' }, {})).toBe('blocked');
    expect(resolveWaterTraversal({ ...ford, current: 'unknown' }, {})).toBe('blocked');
    expect(resolveWaterTraversal(ford, {})).toBe('blocked');
  });

  it('requires swimming and known non-dangerous current to swim across rivers', () => {
    const river = { surface: 'water' as const, feature: 'river' as const, depth: 'medium' as const, current: 'moderate' as const };
    expect(resolveWaterTraversal(river, {})).toBe('blocked');
    expect(resolveWaterTraversal(river, { canSwim: true })).toBe('swim');
    expect(resolveWaterTraversal({ ...river, current: 'strong' }, { canSwim: true })).toBe('blocked');
    expect(resolveWaterTraversal({ ...river, current: 'unknown' }, { canSwim: true })).toBe('blocked');
  });

  it('fails closed when water depth is unknown', () => {
    expect(resolveWaterTraversal(
      { surface: 'water', feature: 'lake', depth: 'unknown' },
      { canSwim: true },
    )).toBe('blocked');
  });
});
