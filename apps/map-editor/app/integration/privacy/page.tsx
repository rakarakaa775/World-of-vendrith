export default function IntegrationPrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p><strong>World of Vendrith DevTools</strong></p>
      <p>This development integration uses information returned by Vercel only for authorized project and deployment inspection.</p>
      <h2>Data use</h2>
      <p>Project metadata and deployment information are used to diagnose builds, review deployment state, and support development workflows.</p>
      <h2>Credentials</h2>
      <p>Vercel authorization credentials are not intentionally exposed to client-side code or committed to the repository.</p>
      <h2>Contact</h2>
      <p>For privacy questions, use the support contact configured for this integration.</p>
    </main>
  );
}
