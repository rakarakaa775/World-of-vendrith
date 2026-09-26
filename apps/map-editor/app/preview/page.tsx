"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";

const previewLayers = ["World Terrain", "Region Boundaries", "Playable", "Life", "Events"];

export default function PreviewPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [zoom, setZoom] = useState(100);
  const [layers, setLayers] = useState([true, true, false, false, false]);
  const [playing, setPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return <main className="vandrith-preview-loading">Memeriksa akun...</main>;
  }

  return (
    <main className="vandrith-preview">
      <header className="vandrith-preview-topbar">
        <button className="vandrith-preview-back" type="button" onClick={() => router.push("/")}>
          <span>‹</span> Control Center
        </button>
        <div className="vandrith-preview-title">
          <span>PREVIEW ENGINE</span>
          <strong>World of Vendrith</strong>
        </div>
        <div className="vandrith-preview-status">
          <i aria-hidden="true" />
          <span>Preview Environment</span>
        </div>
      </header>

      <div className="vandrith-preview-toolbar">
        <div className="vandrith-preview-toolbar-group">
          <button type="button" className="is-active">World</button>
          <button type="button">Region</button>
          <button type="button">Playable</button>
          <button type="button">Interior</button>
        </div>
        <div className="vandrith-preview-toolbar-group">
          <button type="button" onClick={() => setZoom(value => Math.max(50, value - 10))}>−</button>
          <span>{zoom}%</span>
          <button type="button" onClick={() => setZoom(value => Math.min(200, value + 10))}>+</button>
          <button type="button" onClick={() => setZoom(100)} aria-label="Reset zoom">⌖</button>
          <button type="button" className={showGrid ? "is-active" : ""} onClick={() => setShowGrid(value => !value)} aria-pressed={showGrid}>Grid</button>
          <button type="button" className={showCoordinates ? "is-active" : ""} onClick={() => setShowCoordinates(value => !value)} aria-pressed={showCoordinates}>XY</button>
        </div>
      </div>

      <section className="vandrith-preview-stage" aria-label="World preview viewport">
        <div className="vandrith-preview-scene" style={{ transform: `scale(${zoom / 100})` }}>
          <div className="vandrith-preview-mist mist-one" />
          <div className="vandrith-preview-mist mist-two" />
          <div className="vandrith-preview-mountain mountain-back" />
          <div className="vandrith-preview-mountain mountain-mid" />
          <div className="vandrith-preview-ground">
            <div className="vandrith-preview-river" />
            <div className="vandrith-preview-forest forest-one" />
            <div className="vandrith-preview-forest forest-two" />
            <div className="vandrith-preview-settlement">
              <span />
              <span />
              <span />
              <b>North Vale</b>
            </div>
          </div>
          <div className="vandrith-preview-crosshair" aria-hidden="true">
            <span />
            <span />
          </div>
          {showCoordinates && <div className="vandrith-preview-coordinates">X 064 · Y 041 · REGION NORTH VALE</div>
        </div>

        <aside className="vandrith-preview-inspector">
          <div className="vandrith-preview-panel-heading">
            <span>PREVIEW CONTEXT</span>
            <small>LIVE</small>
          </div>
          <h1>World of Vendrith</h1>
          <p>Authoritative World Map</p>

          <dl>
            <div><dt>World</dt><dd>Loaded</dd></div>
            <div><dt>Terrain</dt><dd>Runtime ready</dd></div>
            <div><dt>Life</dt><dd>Not generated</dd></div>
            <div><dt>Events</dt><dd>Standby</dd></div>
          </dl>

          <div className="vandrith-preview-panel-heading layer-heading">
            <span>LAYERS</span>
            <small>5</small>
          </div>
          <div className="vandrith-preview-layers">
            {previewLayers.map((layer, index) => (
              <button
                key={layer}
                type="button"
                className={layers[index] ? "is-on" : ""}
                onClick={() => setLayers(current => current.map((enabled, layerIndex) => layerIndex === index ? !enabled : enabled))}
                aria-pressed={layers[index]}
              >
                <i aria-hidden="true" />
                <span>{layer}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <footer className="vandrith-preview-bottom">
        <div className="vandrith-preview-playback">
          <button type="button" aria-label="Play preview" onClick={() => setPlaying(true)}>▶</button>
          <button type="button" aria-label="Pause preview" onClick={() => setPlaying(false)}>Ⅱ</button>
          <button type="button" aria-label="Reset preview">↺</button>
          <span>{playing ? "PLAYING" : "00:00:00"}</span>
        </div>
        <div className="vandrith-preview-mode">
          <span>SIMULATION</span>
          <strong>EDITOR PREVIEW</strong>
        </div>
        <button type="button" className="vandrith-preview-exit" onClick={() => router.push("/world-builder?workspace=world&load=1")}>
          Open World Builder →
        </button>
      </footer>
    </main>
  );
}
