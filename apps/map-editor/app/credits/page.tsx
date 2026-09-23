export default function CreditsPage() {
  return (
    <main className="vandrith-credits">
      <section className="vandrith-credits-card">
        <p className="vandrith-kicker">WORLD OF VENDRITH</p>
        <h1>Credits</h1>
        <p>Tempat untuk menyimpan dan menampilkan seluruh asset, sumber, lisensi, dan creator yang digunakan oleh Vandrith Map Editor.</p>
        <div className="vandrith-credit-section">
          <h2>Asset Library</h2>
          <p>Daftar asset akan diambil dari registry asset resmi proyek, termasuk informasi sumber dan lisensinya.</p>
        </div>
        <button onClick={() => window.location.assign("/")}>Kembali</button>
      </section>
    </main>
  );
}
