"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";

const previewLayers = ["World Terrain", "Region Boundaries", "Playable", "Life", "Events"];

export default function PreviewPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

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
          <button type="button">−</button>
          <span>100%</span>
          <button type="button">+</button>
          <button type="button">⌖</button>
        </div>
      </div>

      <section className="vandrith-preview-stage" aria-label="World preview viewport">
        <div className="vandrith-preview-scene">
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
          <div className="vandrith-preview-coordinates">X 064 · Y 041 · REGION NORTH VALE</div>
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
              <button key={layer} type="button" className={index < 2 ? "is-on" : ""}>
                <i aria-hidden="true" />
                <span>{layer}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <footer className="vandrith-preview-bottom">
        <div className="vandrith-preview-playback">
          <button type="button" aria-label="Play preview">▶</button>
          <button type="button" aria-label="Pause preview">Ⅱ</button>
          <button type="button" aria-label="Reset preview">↺</button>
          <span>00:00:00</span>
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
