"use client";

import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';
import type { MapDocument } from '../editor/map-document';
import { indexFor } from '../editor/grid';

export function PixiMapCanvas({ document }: { document: MapDocument }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();
    void app.init({
      resizeTo: host,
      background: '#0f1318',
      antialias: true,
    }).then(() => {
      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      host.replaceChildren(app.canvas);
      app.stage.removeChildren();

      const grid = new Graphics();
      const width = document.width * document.tileSize;
      const height = document.height * document.tileSize;
      const viewScale = Math.min((host.clientWidth - 24) / width, (host.clientHeight - 24) / height, 1);
      const offsetX = Math.max((host.clientWidth - width * viewScale) / 2, 0);
      const offsetY = Math.max((host.clientHeight - height * viewScale) / 2, 0);

      grid.position.set(offsetX, offsetY);
      grid.scale.set(viewScale);

      grid.rect(0, 0, width, height).stroke({ width: 1, color: 0x3a424d, alpha: 1 });
      for (let x = 1; x < document.width; x += 1) {
        grid.moveTo(x * document.tileSize, 0).lineTo(x * document.tileSize, height);
      }
      for (let y = 1; y < document.height; y += 1) {
        grid.moveTo(0, y * document.tileSize).lineTo(width, y * document.tileSize);
      }
      grid.stroke({ width: 1, color: 0x242b33, alpha: 1 });

      const ground = document.layers.find((layer) => layer.kind === 'ground');
      if (ground) {
        for (let index = 0; index < ground.cells.length; index += 1) {
          const cell = ground.cells[index];
          if (!cell?.tileId) continue;
          const x = index % document.width;
          const y = Math.floor(index / document.width);
          const tile = new Graphics();
          tile.rect(x * document.tileSize + 2, y * document.tileSize + 2, document.tileSize - 4, document.tileSize - 4)
            .fill({ color: 0x334455, alpha: 1 });
          grid.addChild(tile);
        }
      }

      // Keep the grid coordinate mapping explicit for future pointer editing.
      void indexFor({ x: 0, y: 0 }, document.width);
      app.stage.addChild(grid);
    });

    return () => {
      disposed = true;
      app.destroy(true, { children: true });
    };
  }, [document]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%', minHeight: 320 }} />;
}
