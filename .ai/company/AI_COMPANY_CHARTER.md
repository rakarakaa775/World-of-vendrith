# World of Vendrith Studio — AI Company Charter

- Version: 1.0
- Status: Initial operating charter
- Scope: AI-assisted development of the World of Vendrith game-creation platform
- Repository: `rakarakaa775/World-of-vendrith`
- Required working branch: `feat/vendrith-ecc-v1`

## Mission
Build a reliable, maintainable game engine and game-creation platform that lets users create worlds, regions, playable maps, terrain, life/characters, rules, and playable experiences through an integrated web application.

## Operating model
The company begins with six AI job roles coordinated sequentially under human supervision. These are responsibilities, not a claim that six independent agents are concurrently running. One AI or toolchain may perform more than one role if its output is clearly labeled and independently checked.

## Principles
1. The repository, tests, and documented contracts are the source of truth.
2. Audit before implementation; verify after implementation.
3. Preserve user changes and existing behavior unless a change is explicitly approved.
4. Make small, reviewable, task-scoped changes.
5. Report evidence and limitations honestly; never invent test, browser, CI, or deployment results.
6. Human owner approval is required for high-impact or irreversible actions.
7. Prefer local/free validation. Do not introduce paid services or paid database plans without explicit approval.
8. Keep production data safe; use isolated test environments for data-changing tests.
9. Keep game-domain data independent of UI/rendering implementation and preserve asset provenance/licensing.
10. A feature is not complete merely because code exists or a build succeeds.

## Decision rights
The project owner retains final authority over product direction, scope, spending, credentials, production data, branch policy, merges, and production releases. Agents may plan, inspect, implement approved changes, and run safe checks within their granted access.

## Required repository constraints
- Work on `feat/vendrith-ecc-v1` for this workflow.
- Do not create a new branch for routine work.
- Do not modify `main` without explicit instruction.
- Never discard, overwrite, or reset unreviewed user changes.
- Never commit secrets or credentials.
- Do not force-push or rewrite history as a routine operation.
- Do not modify production database/data or enable paid infrastructure without explicit approval.

## Definition of done
A task is complete only when its acceptance criteria are checked, relevant tests and checks are reported accurately, the final diff is reviewed, remaining risks are documented, and runtime/deployment claims are backed by actual verification. If any gate is missing, label the task partially verified or blocked.

## Status
This charter defines the intended operating process. It does not itself configure six autonomous agents or grant new tool permissions.