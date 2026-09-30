"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, updatePassword } from "../../editor/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [changeMode, setChangeMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    setChangeMode(new URLSearchParams(window.location.search).get("mode") === "change");
  }, []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (changeMode && currentPassword.length === 0) {
      setError("Masukkan password saat ini.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password, changeMode ? currentPassword : undefined);
      await signOut();
      setMessage("Password berhasil diperbarui. Silakan login kembali.");
      setTimeout(() => router.replace("/"), 900);
      setPassword("");
      setConfirmation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ganti password gagal. Gunakan link reset terbaru.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="vandrith-home">
      <section className="vandrith-home-card">
        <p className="vandrith-kicker">WORLD OF VENDRITH</p>
        <h1>{changeMode ? "Ganti Password" : "Reset Password"}</h1>
        <p className="vandrith-subtitle">{changeMode ? "Masukkan password saat ini untuk mengonfirmasi perubahan akun." : "Buat password baru dari link reset yang dikirim ke email akun Vendrith."}</p>
        <form className="vandrith-auth-panel" onSubmit={submit}>
          {changeMode && <label>Password saat ini<input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required /></label>}
          <label>Password baru<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
          <label>Konfirmasi password<input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
          <button type="submit" className="vandrith-auth-submit" disabled={busy} aria-busy={busy}>{busy ? "Menyimpan..." : "Simpan Password Baru"}</button>
          {error && <p className="vandrith-auth-message" role="alert" aria-live="assertive">{error}</p>}
          {message && <p className="vandrith-auth-message" role="status" aria-live="polite">{message}</p>}
          <button type="button" className="vandrith-auth-forgot" onClick={() => router.push("/")}>Kembali ke Menu Utama</button>
        </form>
      </section>
    </main>
  );
}
