export default function IntegrationDocsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>World of Vendrith DevTools — Documentation</h1>
      <p>This integration provides read-only access to Vercel project and deployment information for authorized development and audit workflows.</p>
      <h2>Requested access</h2>
      <ul>
        <li>Deployments: read</li>
        <li>Projects: read</li>
        <li>Teams: read</li>
        <li>Current user: read</li>
      </ul>
      <h2>Security boundary</h2>
      <p>The integration does not request project environment variables, billing, domain management, deployment writes, or other write access.</p>
      <p>Authorization is performed by Vercel. Credentials must remain server-side and must never be placed in client bundles or source control.</p>
    </main>
  );
}
