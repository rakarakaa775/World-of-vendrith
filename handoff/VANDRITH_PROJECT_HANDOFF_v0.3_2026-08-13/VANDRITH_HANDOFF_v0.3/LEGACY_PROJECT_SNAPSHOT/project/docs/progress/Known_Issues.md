# Known Issues

Active issues and risks. Newest at the top.

> No active blocking issues. Documentation system is complete.
> Architecture Phase is complete and locked.
> Engine Documentation is synchronized with Architecture v1.0.

---

## Resolved

### Documentation Polish (RESOLVED in Phase 0.4.7)
All previously tracked non-blocking watch items have been resolved:
- Architecture Principles section numbering typo: FIXED (§5→6 corrected to §6).
- Cross-reference gaps in `docs/rules/README.md`: FIXED (all 10 domains now listed).
- `07_AI_Rules.md` §8 missing AI Rules self-reference: FIXED (all 8 Rule Books listed).
- Placeholder documents lacked standardized format: FIXED (all now have PLACEHOLDER blocks).

### Engine List Contradiction (RESOLVED in Phase 0.4.6)
The `docs/engine/` placeholder documents previously listed 7 engines (including
Schedule Engine and Task Queue) that contradicted the authoritative Engine
Dependency Graph's 10 engines. All `docs/engine/` documents have been rewritten to
reference the Engine Dependency Graph as the authoritative source. The obsolete
Schedule Engine and Task Queue references have been removed from every document in
the project.

---

## Open
- _(none — no active open issues)_

---

## Watch Items
Items that are not issues but are worth monitoring as development continues:

- **Placeholder documents are intentionally empty.** 12 documents are placeholders
  with standardized PLACEHOLDER blocks. These are expected and will be filled in
  their respective phases (Phase 0.5+ for blueprints, Phase 1+ for database, Phase 3+
  for world/vision/goals/style guide, Phase 3-6 for roadmap milestones).
- **World Bible is empty.** World content is created alongside the gameplay that
  needs it, not in advance.
- **Blueprint folder is empty.** Engine blueprints are created as each system is
  designed, not before.
- **Database schema is empty.** No SQL, no tables until the first persistence milestone.
- **Asset folders are empty.** No assets have been imported or generated yet.
