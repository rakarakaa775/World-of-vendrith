# 01 — Project Rules

> The Vendrith World — Open World Medieval Fantasy Life Simulation RPG
>
> This is the constitutional document for the entire project. Every future engine,
> database table, asset, UI page, AI task, and contributor — human or artificial —
> must follow these rules. They are designed to remain valid from Foundation
> Initialization through full Release.

---

## 1. Project Philosophy

The Vendrith World is built to last. Every decision prioritizes the long-term
health of the project over short-term speed.

- **Modular development.** The project is composed of independent, single-responsibility systems. Each system owns its state and logic, exposes a typed public interface, and never reaches into another system's internals. Systems are replaceable without rewriting their neighbors.
- **Scalability.** Architecture is designed to grow. New engines, content, and systems slot in alongside existing ones without forcing rewrites. Dependencies are one-way and traceable; no circular dependencies are ever introduced.
- **Maintainability.** Code is written for the next reader, not for the writer's convenience. Naming is clear, responsibilities are separated, and complexity is managed through composition and progressive disclosure rather than deep nesting or hidden state.
- **Documentation-first development.** No system is implemented before it is documented. Documentation defines the contract; code fulfills it. Docs live in the repository, evolve with the code, and are treated as a first-class deliverable.
- **Long-term sustainability.** The project is paced. Foundation comes before feature. Each phase is reviewable and reversible. Scope creep is resisted. A shipped, stable slice is always worth more than several half-built systems.

---

## 2. Development Workflow

Every change to the project follows this lifecycle, without exception:

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

- **Planning.** Define the single objective of the sprint. Confirm scope with the Lead Architect. Record the task in `docs/ai/Current_Task.md`.
- **Documentation.** Update or create the relevant docs before writing code. Design interfaces, state shapes, and dependencies on paper first. No system is implemented before it is documented.
- **Implementation.** Write code that matches the documentation. Follow all rules in `docs/rules/`. One responsibility per module; no circular dependencies.
- **Testing.** Verify the build passes. Test the feature in the running dev server where applicable. Check the golden path and edge cases. Never mark a task complete with failing checks.
- **Git Commit.** Small, focused commits — one logical change each. Never commit broken or untested code. Keep the tree clean.
- **GitHub Sync.** Push commits to the connected GitHub repository. Confirm the remote reflects local state.
- **Review.** Review the diff against the sprint goal. Update `docs/progress/Sprint_Log.md` and `Changelog.md`. Mark `Current_Task.md` complete.
- **Next Sprint.** Propose the next task in `docs/ai/Next_Task.md`. Obtain Lead Architect sign-off before starting.

---

## 3. Git Rules

- Every change must be committed to GitHub. Local-only work is not considered delivered.
- One commit equals one clear purpose. A commit must represent a single, coherent change.
- Never mix unrelated features, refactors, or fixes in a single commit.
- Never bypass documentation. A change that requires a doc update is not complete until that doc is updated in the same commit.
- Never commit broken, untested, or commented-out code.
- Keep the tree clean: remove dead code, orphaned files, and unused dependencies in the same change that removes their reason for existing.
- Commit messages are concise and describe the change, not the process of making it.

---

## 4. Documentation Rules

- Every major feature requires documentation before implementation begins.
- Every architecture change updates the relevant documentation in the same commit.
- Documentation is part of the project, not an afterthought. It is reviewed with the same rigor as code.
- Docs live in `docs/` and follow the existing folder structure. No documentation is created outside the established structure.
- Placeholder documents are acceptable only during foundation phases; before a system is implemented, its doc must be filled with real content.
- The `docs/ai/` folder is the working memory for AI-assisted development and must be kept current at all times.

---

## 5. Sprint Rules

- Every sprint has a single, clearly stated objective.
- A sprint must finish before another begins. No parallel sprints.
- No unfinished work should accumulate. If a sprint cannot complete, its remaining scope is re-planned, not carried forward silently.
- A sprint is complete only when its exit criteria are met, the build passes, and documentation is updated.
- Sprint outcomes are recorded in `docs/progress/Sprint_Log.md` and `Changelog.md`.

---

## 6. Feature Rules

- Every feature begins with planning. No feature is implemented without a documented purpose and scope.
- Every feature must belong to the roadmap. Features that do not map to a milestone in `docs/roadmap/` are not started.
- Every feature must be tested before it is marked complete. Untested features are not done.
- No feature is integrated before its supporting engine is stable and documented.
- No feature introduces a circular dependency or bypasses an existing system's public interface.

---

## 7. Project Structure Rules

- Folder organization must remain consistent. The structure defined in Foundation Initialization is the canonical layout.
- No random folders. New folders are proposed to the Lead Architect and documented before creation.
- No duplicate systems. Before creating a new module, search for existing utilities, types, or patterns and extend them instead.
- Files are organized by cohesion: things that change together live together.
- The `@/` path alias maps to `src/`. Deep relative imports are not used where the alias applies.
- No parallel hierarchies. Follow the existing structure; do not invent alternative organizations.

---

## 8. Quality Standards

- **Clean code.** Code is readable, well-named, and free of dead logic. Comments are reserved for the non-obvious *why*, never the *what*.
- **Readability.** Clear visual hierarchy in UI, consistent formatting in code, and straightforward control flow. The next reader should never have to guess intent.
- **Reusability.** Shared logic is extracted only when there are concrete duplicate call sites. Premature abstraction is avoided. Three similar lines are better than a forced early generalization.
- **Maintainability.** Each module has one responsibility. State is explicit and typed. No hidden mutable globals. Dependencies are passed, not reached for.
- **Stability.** I/O is never assumed to succeed. Results are checked before use. Errors are surfaced visibly. Undefined values never reach the screen. Internal code is trusted; system boundaries are validated.

---

## 9. Future Contributors

These rules apply equally to everyone who works on The Vendrith World.

### Developers
- Follow the workflow in Section 2 for every change.
- Read `docs/rules/` before writing code. Refer back when in doubt.
- Match the conventions of neighboring code. A change that looks like the codebase is better than one that imposes outside taste.
- Never merge work that bypasses documentation, tests, or review.

### AI Assistants
- Load `docs/ai/Development_Context.md` and `Project_State.md` before any task.
- Follow the same rules as human developers — no shortcuts around standards.
- Never invent systems, schemas, or APIs that do not exist in the codebase.
- Never create gameplay before the foundation and relevant engine are ready.
- Update `docs/progress/Sprint_Log.md` and `docs/ai/Current_Task.md` after finishing work.
- Propose structural changes to the Lead Architect before applying them.

### Designers
- Define visual and UX direction in `docs/assets/Asset_Style_Guide.md` and `docs/rules/06_UI_Rules.md`.
- Ensure every design is documented before implementation.
- Follow the same folder and naming conventions as the rest of the project.

### Everyone
- The rules in this document are the project's constitution. They do not change with the contributor, the sprint, or the phase.
- When in doubt, choose the option that protects modularity, documentation, and long-term sustainability.

---

## 10. Decision Rules

Every major project decision follows this lifecycle, without exception:

```
Idea
   ↓
Discussion
   ↓
Documentation
   ↓
Approval
   ↓
Implementation
```

- **Idea.** A change, addition, or refactor is proposed. It is recorded before it is acted on.
- **Discussion.** The idea is reviewed against the roadmap, existing architecture, and these rules. Feasibility, scope, and impact are assessed.
- **Documentation.** The decision and its rationale are written into the relevant `docs/` file before any code is written. Architecture is defined on paper first.
- **Approval.** The Lead Architect signs off on the documented decision. No implementation begins before approval.
- **Implementation.** The change is built to match the approved documentation, then tested and reviewed.

### Principles
- No major architecture changes may be implemented without documentation first.
- No large project decisions should be made impulsively. If a decision affects structure, scope, or public interfaces, it goes through the lifecycle above.
- Every architectural decision should be documented before implementation, not after.
- Decisions that are reversed later are still documented — the reasoning behind the reversal is recorded too.

---

## 11. Breaking Changes Policy

Breaking changes are sometimes necessary, but they are never introduced casually.
The goal of this policy is to protect long-term project stability.

A breaking change is any change that alters a public interface, removes or renames
an exported symbol, changes a data shape, or forces consumers to update their code.

Any breaking change must:

- **Be documented.** The change, its scope, and its impact are written down before implementation.
- **Clearly explain the reason.** Why the break is necessary, and why no non-breaking alternative suffices, is recorded in the same change.
- **Update the roadmap if required.** If the change affects a milestone, phase, or planned feature, the roadmap is updated in the same commit.
- **Be tested before merging.** The change is verified against the build, the dev server, and any affected systems before it lands.
- **Never be introduced silently.** A breaking change is always visible in the changelog, the commit message, and the relevant docs. No silent breaks.

### Principles
- Stability is a feature. Breaking changes are the last resort, not the first.
- Prefer additive change: extend interfaces rather than mutate them.
- When a break is unavoidable, make it loud, documented, and reviewed.

