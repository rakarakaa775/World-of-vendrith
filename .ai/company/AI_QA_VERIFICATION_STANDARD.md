# QA and Independent Verification Standard

## Purpose
Prevent code completion, successful compilation, or a passing unit test from being confused with a fully working feature.

## Evidence categories
1. **Static:** lint, typecheck, formatting, diff checks.
2. **Unit/contract:** isolated domain behavior and invariants.
3. **Integration:** interactions across modules, persistence, API, auth, or runtime.
4. **Build:** application compiles and production bundle is generated.
5. **Browser/runtime:** user-visible flows behave as intended in a real running environment.
6. **CI/deployment:** remote checks and deployed version are verified from their actual status.
7. **Recovery/security:** ownership, permissions, failure recovery, concurrency, and data isolation where relevant.

Passing one category does not imply that another category passed.

## Minimum test expectations
- Run focused tests for changed behavior.
- Add regression coverage for a fixed bug when feasible.
- Test relevant invalid input and failure paths.
- Check backward compatibility when persistence/schema contracts change.
- For save/load or runtime changes, verify state survives the required persistence/recovery path.
- For UI changes, verify the rendered interaction when browser access is available.
- For security/permissions changes, verify both authorized and unauthorized access paths.

## Reporting rules
For each command/check, report:
- exact command or source of remote status;
- pass/fail/skipped/blocked;
- concise output or evidence;
- known environment limitation.

Never:
- claim a command was run when it was not;
- describe skipped tests as passed;
- infer production readiness from a local build;
- claim a deployment contains a commit without verifying the deployed revision;
- hide flaky failures or known regressions.

## Independent verification checklist
- [ ] Re-check each acceptance criterion.
- [ ] Inspect final diff and worktree status.
- [ ] Confirm tests correspond to the changed code.
- [ ] Verify browser/runtime behavior if required.
- [ ] Confirm commit and deployment separately.
- [ ] List all unresolved gaps.
- [ ] Set a truthful final status.

## Completion definitions
**Verified:** all required criteria have direct evidence.
**Partially verified:** evidence exists but a required criterion is untested or blocked.
**Failed:** evidence contradicts the expected behavior.
**Blocked:** a required tool, environment, approval, or dependency is unavailable.