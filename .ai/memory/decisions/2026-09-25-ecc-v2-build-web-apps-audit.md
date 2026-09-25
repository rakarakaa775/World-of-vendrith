# ECC v2 decision: adapt build-web-apps engineering patterns

## Context
The affaan-m/plugins repository, especially build-web-apps, was reviewed against Vendrith ECC.

## Decision
Keep Vendrith's domain-specific ECC architecture. Do not clone build-web-apps. Adapt four engineering patterns:
- visual QA
- editor-specific UI engineering
- React/Next performance rules
- Supabase performance/concurrency rules

## Rationale
Vendrith already has stronger domain specialization through Map Editor, PixiJS, game data, asset pipeline, Supabase, Vercel, security, and verification agents. The external plugin is stronger as a reusable web-engineering reference.

## Non-goals
- Do not add Stripe without a Vendrith requirement.
- Do not replace Vendrith agents with a generic web-app agent.
- Do not make the Codex plugin manifest a project requirement.

## Verification policy
Automated tests and browser verification are separate evidence classes. Browser verification must not be claimed unless actually executed.
