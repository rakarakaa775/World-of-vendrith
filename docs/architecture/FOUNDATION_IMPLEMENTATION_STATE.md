# PROJECT STATE — FINAL HANDOFF

This file prevents the implementation workflow from looping back into completed design work.

Foundation design is the baseline. The next phase is implementation and verification.

Do not regenerate the Foundation ERD, conceptual schema, table list, or detailed table specification without an explicit conflict.


## Vendrith Project AI V1 — implementation started

The first read-only foundation is now implemented under `apps/map-editor/ai/`.

Implemented:
- typed AI request/plan/evidence/verification contracts;
- repository, CodeGraph, documentation, asset-registry, and verification ports;
- approval/high-risk policy gate;
- read-only planning service that searches repository/docs and requests dependency/dependent context through CodeGraph;
- policy regression tests with Vitest.

This phase deliberately does not add an LLM provider, unrestricted shell access, automatic mutation, production deployment, or autonomous asset downloading.
