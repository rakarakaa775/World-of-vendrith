# Visual QA

## Purpose
Verify Vendrith editor UI as rendered behavior, not only source code.

## Workflow
1. Identify the exact user flow and acceptance criteria.
2. Run the smallest relevant automated checks.
3. Verify the rendered page in a browser when browser tooling is available.
4. Check page load, console/runtime errors, visible state, and the target interaction.
5. Capture or inspect visual evidence when available.
6. Record mismatches, fix the smallest cause, and re-verify.

## Map Editor focus
- Toolbar and tool state
- Canvas rendering and selection
- Layer/object panels
- Inspector and dialogs
- Save/load/version feedback
- Loading, empty, error, and disabled states
- Keyboard shortcuts and focus behavior

## Evidence
A verification report should distinguish automated evidence from browser evidence. Never claim browser verification when browser tooling was not actually executed.
