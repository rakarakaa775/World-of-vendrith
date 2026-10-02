# Vendrith Creator AI — Live Provider Setup

The `/vendrith-ai` surface now uses:

`ModelProvider → Agent Orchestrator → Tool Router → Evidence → Response`

## Model provider

The first runtime adapter is Vercel AI Gateway through its OpenAI-compatible Chat Completions API. The provider is replaceable through `ModelProviderPort`.

Default model: `openai/gpt-5`.

The Gateway currently exposes tool-capable models and authenticates with `AI_GATEWAY_API_KEY` (or the Vercel OIDC token when available). Keep the key server-side.

## Repository evidence

Creator AI reads the configured Vendrith repository through `GitHubHttpRepositoryAdapter`. Set `GITHUB_TOKEN` when repository/code search needs authenticated GitHub API access.

## Asset evidence

The agent also queries the existing Supabase asset inventory through `asset_library_inventory_v1`. Asset license status remains evidence-driven; the model is not permission to use an asset whose registry state is unclear.

## Safety

The current Creator AI API exposes only `explain` and `plan` modes. All currently registered project tools are read-only. Runtime/game mutations remain behind the existing approval and runtime policy boundaries.

## Local setup

Copy `.env.example` to `.env.local`, then set `AI_GATEWAY_API_KEY`. Do not commit the secret.

For Vercel deployments, configure the same secret in the project environment instead of putting it in source control.
