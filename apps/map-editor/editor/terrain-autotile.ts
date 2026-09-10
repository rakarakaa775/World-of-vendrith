import type { TerrainKey, TerrainMask } from './terrain-engine';
import { resolveTerrainVariant, type TerrainResolver } from './terrain-resolver';

export type TerrainBinding = {
  terrain: TerrainKey;
  mask: TerrainMask;
  tileId: string;
};

export type TerrainBindingMap = Partial<Record<TerrainKey, Partial<Record<number, string>>>>;

export function createTerrainResolver(bindings: TerrainBindingMap): TerrainResolver {
  return (terrain, mask) => bindings[terrain]?.[mask] ?? null;
}

export function resolveBoundTerrain(terrain: TerrainKey, mask: TerrainMask, bindings: TerrainBindingMap) {
  return resolveTerrainVariant(terrain, mask, createTerrainResolver(bindings));
}

export function bindingKey(terrain: TerrainKey, mask: TerrainMask): string {
  return `${terrain}:${mask.toString(16).padStart(2, '0')}`;
}

export function countBindings(bindings: TerrainBindingMap): number {
  return Object.values(bindings).reduce((count, terrainBindings) => count + Object.keys(terrainBindings ?? {}).length, 0);
}
