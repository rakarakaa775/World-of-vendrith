import { Container, Graphics } from 'pixi.js';
import type { EnvironmentVisualLayer, EnvironmentVisualRenderer } from './environment-visual-layer';

/**
 * Minimal renderer adapter. It owns only a visual overlay; simulation state
 * remains outside Pixi and is supplied as immutable snapshots.
 */
export class PixiEnvironmentVisualRenderer implements EnvironmentVisualRenderer {
  private readonly overlay: Graphics;

  constructor(private readonly container: Container) {
    this.overlay = new Graphics();
    container.addChild(this.overlay);
  }

  applyEnvironmentLayer(layer: EnvironmentVisualLayer): void {
    this.overlay.clear();
    if (!layer.enabled || layer.opacity <= 0) {
      this.overlay.visible = false;
      return;
    }

    this.overlay.visible = true;
    const weather = layer.weather;
    const wet = weather.wetness ?? 0;
    const snow = weather.snowCoverage ?? 0;
    const frost = weather.frost ?? 0;
    const mud = weather.mud ?? 0;
    const alpha = Math.min(0.35, Math.max(wet, snow, frost, mud) * 0.35) * layer.opacity;

    if (alpha <= 0) return;

    // Renderer-only atmospheric cue. Terrain identity and asset selection are
    // intentionally untouched by this overlay.
    const overlayColor = snow > 0 || frost > 0 ? 0xe2e8f0 : wet > 0 ? 0x60a5fa : mud > 0 ? 0x8b5e3c : 0x94a3b8;
    this.overlay.rect(0, 0, this.container.width, this.container.height).fill({ color: overlayColor, alpha });
  }

  clearEnvironmentLayer(): void {
    this.overlay.clear();
    this.overlay.visible = false;
  }
}
