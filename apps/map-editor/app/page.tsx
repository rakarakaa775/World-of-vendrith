"use client";

import { useRouter } from "next/navigation";
import { useAuthUser, signOut } from "../editor/auth";
import { AuthPanel } from "../components/auth-panel";

const stars = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 61) % 70, delay: (i % 7) * 0.4 }));

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  return (
    <main className="vandrith-home">
      <div className="vandrith-stars" aria-hidden="true">{stars.map((star, i) => <i key={i} style={{ left: `${star.left}%`, top: `${star.top}%`, animationDelay: `${star.delay}s` }} />)}</div>
      <div className="vandrith-mountains" aria-hidden="true" />
      <div className="vandrith-mist" aria-hidden="true" />
      <section className="vandrith-home-card">
        <div className="vandrith-emblem" aria-hidden="true">✦</div>
        <p className="vandrith-kicker">WORLD OF VENDRITH</p>
        <h1>Vendrith World Builder</h1>
        <p className="vandrith-subtitle">Shape the lands, build the world, and preserve every map of Vendrith.</p>

        {loading ? <p className="vandrith-auth-status">Checking account...</p> : user ? (
          <>
            <p className="vandrith-welcome">Welcome, <strong>{user.username}</strong></p>
            <nav className="vandrith-home-actions" aria-label="World Builder menu">
              <button onClick={() => router.push("/world-builder")}><span>✦</span><strong>World Builder</strong><small>Create and shape a world</small></button>
              <button onClick={() => router.push("/world-builder?load=1")}><span>◈</span><strong>Load World</strong><small>Open an existing world</small></button>
              <button onClick={() => router.push("/credits")}><span>◇</span><strong>Credits</strong><small>Asset & creator credits</small></button>
            </nav>
            <button className="vandrith-logout" onClick={() => void signOut()}>Logout</button>
          </>
        ) : (
          <>
            <AuthPanel onSuccess={() => router.refresh()} />
            <p className="vandrith-auth-note">Save, Load, dan Save Slot akan terikat ke akun yang sedang login.</p>
          </>
        )}
        <p className="vandrith-version">Vendrith World Builder · Development Edition</p>
      </section>
    </main>
  );
}
