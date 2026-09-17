# Map Editor Focused Tests

Purpose: Phase 0 deterministic test harness boundary.

These tests are intentionally focused on pure contracts and failure boundaries before runtime implementation changes are made.

Initial seams:

- MapDocument grid sizing: `width * height`
- Serialization envelope and identity validation
- Requested map identity on load
- Terrain approval boundary
- Save connection/adoption state boundary

## Execution status

The repository currently has no configured test runner. This directory records the required test boundary; the tests are not yet executable until a runner is added.

## Phase 0 rule

Do not treat test files as evidence of passing behavior. Passing evidence requires an actual test runner execution recorded in the Change Log and Status Log.
