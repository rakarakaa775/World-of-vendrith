"use client";

import { useRouter } from "next/navigation";
import { useAuthUser, signOut } from "../editor/auth";
import { AuthPanel } from "../components/auth-panel";

const stars = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 61) % 78,
  delay: (i % 7) * 0.4,
}));

const menuItems = [
  { id: "preview", icon: "◉", title: "Preview", description: "Lihat dunia dan rasakan hasil kerja engine.", status: "ready" },
  { id: "world", icon: "◈", title: "World Building", description: "World, Region, Playable, Interior, Save & Load.", status: "ready" },
  { id: "generate-life", icon: "✧", title: "Generate Life", description: "Bangun populasi dan kehidupan dunia.", status: "planned" },
  { id: "spawn-life", icon: "♙", title: "Spawn Life", description: "Tempatkan dan kelola kehidupan di dunia.", status: "planned" },
  { id: "organization", icon: "♜", title: "Organization World", description: "Kelola faction, kingdom, guild, dan organisasi.", status: "planned" },
  { id: "asset-library", icon: "▦", title: "Asset Library", description: "Kelola asset dan tambahkan asset ke game engine.", status: "planned" },
  { id: "event-engine", icon: "ϟ", title: "Event Engine", description: "Susun event dan kejadian dinamis dunia.", status: "planned" },
  { id: "dialogue", icon: "◌", title: "Dialogue Template", description: "Bangun template percakapan dan dialogue.", status: "planned" },
  { id: "engine-collection", icon: "⚙", title: "Engine Collection", description: "Kumpulan engine dan pemasangan mod ke game engine.", status: "planned" },
  { id: "validation", icon: "✓", title: "Validation & Testing", description: "Periksa world, asset, engine, dan kesiapan runtime.", status: "planned" },
  { id: "game-systems", icon: "⬡", title: "Game Systems", description: "Ruang untuk combat, quest, economy, AI, dan sistem inti.", status: "planned" },
  { id: "settings", icon: "⌘", title: "Project / Engine Settings", description: "Konfigurasi project, environment, account, dan engine.", status: "planned" },
  { id: "credits", icon: "◇", title: "Credits", description: "Attribution, lisensi, dan sumber asset.", status: "ready" },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const openItem = (id: string) => {
    if (id === "preview") {
      router.push("/preview");\n    } else if (id === "world") {
      router.push("/world-builder?workspace=world&load=1");
    } else if (id === "credits") {
      router.push("/credits");
    }
  };

  return (
    <main className="vandrith-home-console">
      <div className="vandrith-console-stars" aria-hidden="true">
        {stars.map((star, i) => (
          <i
            key={i}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="vandrith-console-horizon" aria-hidden="true" />

      <header className="vandrith-console-header">
        <div className="vandrith-console-brand">
          <span className="vandrith-console-mark" aria-hidden="true">✦</span>
          <div>
            <strong>VENDRITH</strong>
            <span>WORLD ENGINE</span>
          </div>
        </div>

        {user && !loading ? (
          <div className="vandrith-console-account">
            <span>Signed in as <strong>{user.username}</strong></span>
            <button type="button" onClick={() => router.push("/reset-password")}>Ganti Password</button>
            <button type="button" onClick={() => void signOut()}>Logout</button>
          </div>
        ) : null}
      </header>

      <section className="vandrith-console-main">
        <div className="vandrith-console-intro">
          <p className="vandrith-console-kicker">WORLD OF VENDRITH</p>
          <h1>Build the world.<br /><em>Then bring it to life.</em></h1>
          <p>
            Satu control center untuk membangun dunia, kehidupan, event,
            dialogue, asset, dan engine Vendrith.
          </p>
        </div>

        {loading ? (
          <div className="vandrith-console-loading">Checking account...</div>
        ) : user ? (
          <>
            <div className="vandrith-console-section-heading">
              <span>ENGINE CONTROL CENTER</span>
              <small>Choose a workspace</small>
            </div>

            <nav className="vandrith-engine-grid" aria-label="Vendrith engine menu">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "vandrith-engine-card",
                    item.id === "preview" ? "featured" : "",
                    item.id === "world" ? "primary" : "",
                    item.status === "planned" ? "planned" : "",
                  ].join(" ").trim()}
                  onClick={() => openItem(item.id)}
                  disabled={item.status === "planned"}
                  aria-label={item.status === "planned" ? `${item.title}, segera hadir` : item.title}
                >
                  <span className="vandrith-engine-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="vandrith-engine-icon" aria-hidden="true">{item.icon}</span>
                  <span className="vandrith-engine-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="vandrith-engine-state">
                    {item.status === "planned" ? "SOON" : "OPEN"} <span aria-hidden="true">→</span>
                  </span>
                </button>
              ))}
            </nav>
          </>
        ) : (
          <div className="vandrith-console-auth">
            <div>
              <p className="vandrith-console-section-label">ACCOUNT ACCESS</p>
              <h2>Masuk ke Vendrith Engine</h2>
              <p>Login untuk membuka control center dan workspace project.</p>
            </div>
            <AuthPanel onSuccess={() => router.refresh()} />
          </div>
        )}

        {user && !loading ? (
          <div className="vandrith-console-footer">
            <span>Vendrith World Engine · Development Edition</span>
            <span>Project: World of Vendrith</span>
          </div>
        ) : (
          <p className="vandrith-console-note">Save, Load, dan Save Slot terikat ke akun yang sedang login.</p>
        )}
      </section>
    </main>
  );
}
