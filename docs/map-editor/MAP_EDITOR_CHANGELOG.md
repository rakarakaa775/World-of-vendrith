# Vandrith Map Editor — Change Log

**Purpose:** Detailed historical record of what was updated, changed, added, removed, restored, reverted, or fixed in the Map Editor.

## Rules

- Every implementation update must add an entry.
- Record both successful changes and reversions when they affect the repository or Supabase contract.
- Never delete historical entries; append corrections as new entries.
- Each entry must identify the date, area, change type, reason, affected files/contracts, and verification state when known.
- If a change is later reverted, record the revert as a separate entry and link it conceptually to the original change.
- This log and `MAP_EDITOR_STATUS_LOG.md` are mandatory companions for every project update.

## Entry format

### YYYY-MM-DD — Short title

- **Type:** Added / Changed / Updated / Removed / Restored / Reverted / Fixed
- **Reason:** Why the change was made.
- **Details:** What was changed.
- **Affected:** Files, database objects, RPCs, UI, serializer, or contracts.
- **Verification:** Not tested / In progress / Verified / Reverted.
- **Notes:** Important compatibility or rollback information.

## 2026-09-16 — Documentation baseline created

- **Type:** Added
- **Reason:** Establish a stable specification before further Save/Load implementation work.
- **Details:** Added the Map Editor Database Contract and formalized the documentation-first workflow.
- **Affected:** `docs/map-editor/MAP_EDITOR_DATABASE_CONTRACT.md`, this changelog, Bible.
- **Verification:** Documentation committed to repository.
- **Notes:** No runtime behavior was changed by this documentation entry.

## 2026-09-16 — Save/Load V4 experiment recorded

- **Type:** Updated / Reverted
- **Reason:** The Save/Load V4 experiment attempted to resolve Supabase map connection and Load state handling, but introduced canvas flicker and still reported save errors.
- **Details:** The V4 experiment was superseded/reverted so canvas stability could be restored before further persistence changes.
- **Affected:** Editor state/history behavior and Save/Load flow.
- **Verification:** Flicker regression observed; persistence issue remained unresolved.
- **Notes:** Future fixes must isolate persistence errors without coupling canvas rendering/history to network state.

## 2026-09-16 — Canvas flicker baseline restored

- **Type:** Restored
- **Reason:** A history-reset comparison introduced render instability during normal painting.
- **Details:** Restored the editor behavior that does not reset history continuously while the document changes during painting.
- **Affected:** `EditorShell` history/document boundary behavior.
- **Verification:** Commit recorded as the stability restoration baseline; browser verification remains required.
- **Notes:** A future Load implementation must create an explicit state boundary only after a successful validated load.

## 2026-09-16 — Database contract and documentation controls formalized

- **Type:** Added / Changed
- **Reason:** Prevent further implementation drift and preserve an auditable project history.
- **Details:** Added the database contract, detailed changelog, and short status log; updated the Bible to require both logs for every repository/database/architecture update.
- **Affected:** `MAP_EDITOR_DATABASE_CONTRACT.md`, `MAP_EDITOR_CHANGELOG.md`, `MAP_EDITOR_STATUS_LOG.md`, `MAP_EDITOR_BIBLE.md`.
- **Verification:** Documentation committed to GitHub.
- **Notes:** Future implementation work must update both logs in the same work session as the change.
