# 02 — Coding Rules

> The Vendrith World — coding standards for the entire project.
>
> TypeScript + React + Vite. These rules apply to every line of code written for
> the project, by human or artificial contributor. They exist to keep the codebase
> readable, reusable, testable, maintainable, predictable, and stable across the
> full development lifecycle.

---

## 1. General Principles

- **Readability over cleverness.** Code is written for the next reader. If a construct requires a comment to explain *what* it does, it is too clever.
- **Simplicity over complexity.** Choose the simplest approach that solves the problem. Complexity is added only when justified by a concrete requirement.
- **Consistency across the project.** A change that matches neighboring code is better than one that imposes outside taste. Follow existing patterns before introducing new ones.
- **Self-documenting code.** Clear naming, single responsibility, and straightforward control flow replace the need for most comments. The code explains itself.

---

## 2. TypeScript Rules

- TypeScript is mandatory. No plain JavaScript.
- Strict mode is always on (`"strict": true`).
- Every function parameter, return type, and shared object must be explicitly typed.
- Avoid `any`. Prefer `unknown` with type narrowing when a type is truly unknown.
- Prefer `interface` for object shapes that may be extended or implemented. Prefer `type` for unions, tuples, and aliases.
- Explicit return types are required for all exported functions. Internal helpers may infer when the return type is obvious.
- Never use untyped index access (`obj[key]` where `key` is a string). Type the keys.
- Prefer readonly fields and immutable data where practical.

---

## 3. Function Rules

- One responsibility per function. A function does one thing and names itself after that thing.
- Keep functions reasonably short. If a function grows beyond a single screen, look for a responsibility to extract.
- Avoid deeply nested logic. Flatten control flow with early returns and guard clauses.
- Prefer early returns over nested `if/else` chains.
- No hidden side effects. A function either returns a value or performs an effect, and its name reflects which.
- Pass dependencies as arguments. Do not reach for module-level mutable state or globals.
- Pure functions are preferred where feasible. Side effects are isolated and explicit.

---

## 4. File Organization

- One responsibility per file. A file owns a single concern.
- Related logic stays together. Things that change together live together.
- Avoid giant files. Split when a file becomes hard to navigate, not to hit a line target.
- Maintain a clear folder hierarchy. Follow the existing structure; do not invent parallel organizations.
- Place new files where a reader would expect to find them based on the current layout.
- Export only what callers need. Keep internal helpers unexported.
- Do not leave orphaned files, dead exports, or commented-out blocks. The tree stays clean.

---

## 5. Naming Conventions

Consistent naming is the foundation of readable code. Detailed naming rules live
in `08_Naming_Rules.md`; the baseline below applies everywhere.

- Names describe meaning, not implementation. `getUserProfile` over `fetchData`.
- Boolean variables and predicates are prefixed with `is`, `has`, or `can` (`isLoading`, `hasPermission`).
- Avoid abbreviations except widely understood ones (`url`, `id`, `api`).
- Use the same word for the same concept everywhere. Do not alternate synonyms.
- Names are honest. A function named `get` should not mutate state.

---

## 6. Comments

- Default to no comments. Code should explain itself through naming.
- Explain *why*, not *what*. A comment is reserved for the non-obvious: a hidden constraint, a subtle invariant, a workaround, or a surprising behavior.
- Avoid unnecessary comments. If removing the comment would not confuse a future reader, do not write it.
- Keep comments synchronized with the code. A stale comment is worse than no comment.
- Never write multi-paragraph comment blocks. One short line maximum.
- Do not reference the current task, fix, or callers in comments — that belongs in the commit message, not the code.

---

## 7. Error Handling

- **Defensive programming.** Never assume I/O succeeds. Check results before using them. Confirm a response has the expected shape before binding it into the UI.
- **Clear error messages.** Errors describe what went wrong and, where useful, what to do next. No opaque codes or bare stack traces.
- **Graceful failure.** The app degrades visibly, not silently. A failed operation shows a clear state rather than crashing or rendering undefined.
- **Avoid silent failures.** Never swallow an error without surfacing it. Empty `catch` blocks are not allowed.
- Validate at system boundaries (user input, external APIs). Trust internal code; do not re-validate data that already passed a boundary.
- Surface visible error states to the user. Undefined values never reach the screen.

---

## 8. Imports

- Remove unused imports. No dead imports remain in a committed file.
- Avoid circular dependencies. Dependency direction is one-way and traceable.
- Group imports consistently: external packages first, then project modules via `@/`, then relative imports.
- Use the `@/` path alias for project modules (`@/components/Foo` → `src/components/Foo`). Deep relative paths are not used where the alias applies.
- Import every symbol you reference. No implicit globals or assumed-available types.
- Prefer project structure consistency. Import from the established locations; do not invent new import roots.

---

## 9. Performance

- Avoid premature optimization. Write clear, correct code first. Optimize only when a measured problem demands it.
- Avoid duplicated logic. Reuse existing utilities, types, and patterns before writing a parallel version.
- Reuse existing utilities. If a helper exists, use it. If one almost exists, extend it instead of adding a duplicate.
- Keep code maintainable. Performance choices that harm readability are justified only by evidence, not intuition.
- Prefer stable, predictable behavior over clever shortcuts that may break under edge cases.

---

## 10. Quality Standards

Every code contribution to The Vendrith World must be:

- **Readable.** Clear naming, straightforward flow, no cleverness for its own sake.
- **Reusable.** Shared logic is extracted only with concrete duplicate call sites; no premature abstraction.
- **Testable.** Each module is runnable and testable in isolation. Dependencies are passed, not reached for.
- **Maintainable.** One responsibility per module. Explicit, typed state. No hidden mutable globals.
- **Predictable.** Functions do what their names say. No hidden side effects or surprising behaviors.
- **Stable.** I/O is checked, errors are surfaced, and undefined values never reach the screen.

A contribution that fails any of these standards is not done, regardless of whether it builds.
