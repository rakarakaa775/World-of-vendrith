import type { Container } from 'pixi.js';
import type { EnvironmentRuntimeState } from './environment-runtime';
import { createEnvironmentVisualLayer } from './environment-visual-layer';
import { PixiEnvironmentVisualRenderer } from './pixi-environment-visual-renderer';

/**
 * Lifecycle-safe controller for Map Editor Pixi scenes.
 * Call update whenever the authoritative runtime snapshot changes and dispose
 * it with the Pixi scene.
 */
export class PixiEnvironmentController {
  private readonly renderer: PixiEnvironmentVisualRenderer;

  constructor(container: Container) {
    this.renderer = new PixiEnvironmentVisualRenderer(container);
  }

  update(runtime: EnvironmentRuntimeState | null): void {
    this.renderer.applyEnvironmentLayer(createEnvironmentVisualLayer(runtime));
  }

  clear(): void {
    this.renderer.clearEnvironmentLayer();
  }
}
