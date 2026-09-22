export default function IntegrationSupportPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>Support</h1>
      <p>Support for World of Vendrith DevTools covers integration setup, authorization, and deployment/project inspection.</p>
      <p>If an authorization request fails, verify that the integration is installed for the intended Vercel team/project and that its read scopes are granted.</p>
      <p>For account-specific access issues, use the Vercel dashboard to review the integration installation and project access.</p>
    </main>
  );
}
