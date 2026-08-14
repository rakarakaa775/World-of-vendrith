# 07 — AI Rules

> The Vendrith World — rules for AI-assisted development.
>
> These rules apply to every AI assistant that works inside the project: Bolt, Replit,
> ChatGPT, and any future AI tools. They govern how AI operates, what it may decide, and
> how it hands work back to humans. AI is a contributor, not an owner.

---

## 1. AI Philosophy

- AI exists to assist development. It accelerates implementation, documentation, and review — it does not set the project's direction.
- AI never owns the project. The codebase, the architecture, and the roadmap belong to the human team.
- Humans always make final decisions. An AI may propose, but a human approves. No AI commits a structural or breaking change on its own authority.

---

## 2. Working Memory

Before starting any task, every AI must review the files in `docs/ai/`:

- `Project_State.md` — the current state of the project.
- `Current_Sprint.md` — the active sprint and its goals.
- `Current_Task.md` — the specific task in progress.
- `Development_Context.md` — the context needed to continue work.
- `Next_Task.md` — the task queued after the current one.

After finishing work, the AI updates the relevant documents: progress in `Current_Task.md`, sprint status in `Current_Sprint.md`, project state in `Project_State.md`, and the next queued task in `Next_Task.md`. An AI that does not read working memory before starting, or does not update it after finishing, has not completed its task.

---

## 3. Documentation First

- AI must never create major systems before documentation exists.
- Documentation precedes implementation. The design doc, the engine template, the schema, and the rule references are written and approved before any code.
- If a task requires a system that is not yet documented, the AI stops and writes the documentation first, or escalates to the Lead Architect.
- This rule mirrors the Decision Rules in `01_Project_Rules.md`: Idea → Discussion → Documentation → Approval → Implementation. AI never skips to Implementation.

---

## 4. Escalation Policy

AI must request approval from the Lead Architect before any of the following:

- **Architecture changes** — any change to the structure of engines, layers, or the dependency graph.
- **Folder structure changes** — any new top-level folder, renamed folder, or reorganization.
- **Database redesign** — any schema change beyond an additive migration.
- **Breaking changes** — any change that alters a public interface, removes a symbol, or changes a data shape.
- **Engine dependency changes** — any new dependency between engines, or any change to the dependency direction.
- **Roadmap restructuring** — any change to milestones, phases, or sprint order.

AI may not make these decisions autonomously. When in doubt, the AI escalates. The cost of pausing to confirm is always lower than the cost of an unwanted structural change.

---

## 5. Single Source of Truth

Every project domain has one official document. AI must never create conflicting copies.

- **Rules** → `docs/rules/`
- **Architecture** → `docs/architecture/`
- **Roadmap** → `docs/roadmap/`
- **Database** → `docs/database/`
- **Engine** → `docs/engine/`
- **Assets** → `docs/assets/`
- **AI working memory** → `docs/ai/`
- **Progress** → `docs/progress/`
- **Project** → `docs/project/`
- **World** → `docs/world/`

When information is needed, the AI reads the official source. When information changes, the AI updates the official source. No parallel notes, no shadow docs, no duplicated truth.

---

## 6. Git Workflow

AI never bypasses Git workflow. Every completed task ends with this sequence:

```
Documentation
   ↓
Testing
   ↓
Git Commit
   ↓
GitHub Sync
```

- **Documentation.** All relevant docs are updated in the same change as the code.
- **Testing.** The build passes and affected systems are verified before a commit.
- **Git Commit.** The change is committed with a clear message describing what and why.
- **GitHub Sync.** The commit is pushed to the remote.

No AI pushes without a passing build. No AI force-pushes or rewrites history without explicit human approval.

---

## 7. Communication

AI should:

- **Explain reasoning clearly.** The human team understands why a decision was made, not just what was produced.
- **Avoid assumptions.** When a requirement is ambiguous, the AI asks. It does not guess and proceed.
- **Report blockers honestly.** If something failed, the AI says so plainly. No green-washing, no hiding failures behind vague wording.
- **Never invent missing information.** If a file, API, or system does not exist, the AI says it does not exist. It does not fabricate a plausible-looking substitute.

---

## 8. Code Generation

AI follows all existing Rule Books — Project, Coding, Engine, Database, Asset, UI, AI, and Naming. Generated code must be:

- **Modular** — one responsibility per module, clear boundaries.
- **Readable** — clear naming, straightforward flow, no cleverness for its own sake.
- **Testable** — dependencies passed, not reached for; no hidden globals.
- **Reusable** — shared logic extracted only with concrete duplicate call sites.

AI does not introduce abstractions, error handling, or validation beyond what the task requires. It does not add features the user did not ask for. It leaves the tree clean.

---

## 9. Collaboration

- Multiple AI assistants may collaborate on the project.
- No AI owns a specific subsystem. Any assistant may work on any area, following the same standards.
- All assistants follow the same rules, the same naming conventions, and the same workflow. There are no per-assistant exceptions.
- When one AI hands off to another, the handoff is recorded in `docs/ai/` working memory. The next AI reads before it writes.

---

## 10. Future Expansion

- Future AI tools automatically inherit these rules.
- A new AI assistant is not exempt because it is new. It reads the Rule Books and the working memory before its first task.
- When a new tool requires a new rule, the rule is added to this document — not invented ad hoc by the assistant.
- These rules are permanent. They do not relax for a deadline, a sprint, or a particular tool.
