# Development Workflow

> The Vendrith World — the lifecycle every change follows.

## Lifecycle

```
Planning
   ↓
Documentation
   ↓
Implementation
   ↓
Testing
   ↓
Git Commit
   ↓
GitHub Sync
   ↓
Review
   ↓
Next Sprint
```

## 1. Planning
- Define the single focus of the sprint.
- Confirm scope with the Lead Architect.
- Record the task in `docs/ai/Current_Task.md`.

## 2. Documentation
- Update or create the relevant docs before writing code.
- Design interfaces, state shapes, and dependencies on paper first.
- No system is implemented before it is documented.

## 3. Implementation
- Write code that matches the documentation.
- Follow all rules in `docs/rules/`.
- One responsibility per module; no circular dependencies.

## 4. Testing
- Verify the build passes.
- Test the feature in the running dev server where applicable.
- Check golden path and edge cases.
- Never mark a task complete with failing checks.

## 5. Git Commit
- Small, focused commits — one logical change each.
- Never commit broken or untested code.
- Keep the tree clean: remove dead code and orphaned files.

## 6. GitHub Sync
- Push commits to the connected GitHub repository.
- Confirm the remote reflects local state.

## 7. Review
- Review the diff against the sprint goal.
- Update `docs/progress/Sprint_Log.md` and `Changelog.md`.
- Mark `Current_Task.md` complete.

## 8. Next Sprint
- Propose the next task in `docs/ai/Next_Task.md`.
- Get Lead Architect sign-off before starting.

## Rules
- No phase begins until the previous is signed off.
- No gameplay before its engine is ready.
- No engine before its design doc is approved.
- Documentation is part of the deliverable, not an afterthought.
