import type { EnvironmentRuntimeState } from './environment-runtime';
import { terrainWeatherVisualContext, type TerrainWeatherVisualContext } from './environment-weather-context';

export type EnvironmentVisualLayer = {
  enabled: boolean;
  seasonKey: string | null;
  weather: TerrainWeatherVisualContext;
  opacity: number;
};

export function createEnvironmentVisualLayer(
  runtime: EnvironmentRuntimeState | null,
): EnvironmentVisualLayer {
  const authoritative = runtime?.source === 'engine';
  return {
    enabled: authoritative,
    seasonKey: authoritative ? runtime?.context.seasonKey ?? null : null,
    weather: terrainWeatherVisualContext(runtime),
    opacity: authoritative ? 1 : 0,
  };
}

/** Renderer-neutral contract: PixiJS/Phaser consume this snapshot but never mutate it. */
export type EnvironmentVisualRenderer = {
  applyEnvironmentLayer(layer: EnvironmentVisualLayer): void;
  clearEnvironmentLayer(): void;
};
