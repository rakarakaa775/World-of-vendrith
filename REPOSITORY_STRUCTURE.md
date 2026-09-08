# Vandrith Repository Structure

## Root

Root contains only primary project entry/status files: README.md and PROJECT_STATUS.md.

## docs/

Current project documentation.

- architecture/ — architecture and implementation-state documents.
- audits/ — current audit results.
- checkpoints/ — checkpoint and repository synchronization records.
- database/reconciliation/ — runtime/database reconciliation records.
- handoff/ — current handoff notes that are not part of the historical snapshot.

## database/

Database design and reconciliation material.

- migrations/ — numbered historical/source migrations captured in the repository.
- specifications/ — table/schema specifications.
- validation/ — validation records.
- reconciliation/ — database hardening and reconciliation artifacts.

## supabase/

Exact Supabase migration source captured from verified working sessions. Do not infer missing migration SQL from migration names.

## handoff/

Preserved historical handoff package. It is archival/source evidence and may contain legacy project snapshots.

## SOURCE_ARCHIVE/

Source/archive manifests and preserved source evidence.

## archive/

Large packaged historical snapshots retained as archives.

## Organization rule

Do not mix historical handoff material with current implementation documents. Do not delete historical source merely to make the tree look smaller. Prefer moving current documents into the appropriate docs/ category while preserving provenance.
