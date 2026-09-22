export default function IntegrationLoginPage() {
  const clientId = process.env.VERCEL_INTEGRATION_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>Integration Login</h1>
      <p>This endpoint is the starting page for the Vercel authorization flow.</p>
      <p>Integration configuration is incomplete until Vercel provides the integration credentials. No client secret is displayed here.</p>
      <dl>
        <dt>Configured client ID</dt>
        <dd>{clientId ? "present" : "not configured"}</dd>
        <dt>Application URL</dt>
        <dd>{appUrl || "not configured"}</dd>
      </dl>
      <p><a href="/integration/docs">Read the integration documentation</a></p>
    </main>
  );
}
