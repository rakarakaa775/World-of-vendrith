"use client";

import { useRouter } from "next/navigation";

const stars = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 61) % 70, delay: (i % 7) * 0.4 }));

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="vandrith-home">
      <div className="vandrith-stars" aria-hidden="true">
        {stars.map((star, i) => <i key={i} style={{ left: `${star.left}%`, top: `${star.top}%`, animationDelay: `${star.delay}s` }} />)}
      </div>
      <div className="vandrith-mountains" aria-hidden="true" />
      <div className="vandrith-mist" aria-hidden="true" />
      <section className="vandrith-home-card">
        <div className="vandrith-emblem" aria-hidden="true">✦</div>
        <p className="vandrith-kicker">WORLD OF VENDRITH</p>
        <h1>Vandrith Map Editor</h1>
        <p className="vandrith-subtitle">Shape the lands, build the world, and preserve every map of Vendrith.</p>
        <nav className="vandrith-home-actions" aria-label="Map editor menu">
          <button onClick={() => router.push("/editor")}><span>✦</span><strong>Buat Map</strong><small>Create a new world</small></button>
          <button onClick={() => router.push("/editor?load=1")}><span>◈</span><strong>Load Map</strong><small>Open an existing map</small></button>
          <button onClick={() => router.push("/credits")}><span>◇</span><strong>Credits</strong><small>Asset & creator credits</small></button>
        </nav>
        <p className="vandrith-version">Vandrith Map Editor · Development Edition</p>
      </section>
    </main>
  );
}
