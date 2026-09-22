export default function IntegrationPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>World of Vendrith DevTools</h1>
      <p>Development integration for inspecting World of Vendrith deployment and project metadata through Vercel.</p>
      <p>This integration is intended for the project owner and authorized development workflows.</p>
      <nav style={{ display: "grid", gap: 8, marginTop: 24 }}>
        <a href="/integration/docs">Documentation</a>
        <a href="/integration/privacy">Privacy Policy</a>
        <a href="/integration/terms">Terms / EULA</a>
        <a href="/integration/support">Support</a>
        <a href="/integration/login">Integration Login</a>
      </nav>
    </main>
  );
}
