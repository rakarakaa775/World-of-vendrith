# 06 — UI Rules

> The Vendrith World — permanent standards for the user interface layer.
>
> The UI is how the player sees and touches the simulation. It is a thin layer over
> the engines, never the simulation itself. These rules apply to every component,
> page, and interaction in the project.

---

## 1. UI Philosophy

- **Clarity.** The player always understands what they are looking at and what they can do next. No mystery meat, no unlabeled icons, no hidden state.
- **Simplicity.** Each screen does one thing. Complexity is revealed progressively, not piled onto a single view.
- **Consistency.** The same action looks and behaves the same everywhere. A button is a button; a list is a list. No one-off patterns.
- **Accessibility.** The UI is usable by the widest possible audience. Accessibility is a baseline, not a polish step.
- **Scalability.** The UI is designed to grow. New features extend the existing component system; they do not spawn parallel UIs.

---

## 2. UI Layering

The UI is a strict layer over the simulation. The dependency direction is one-way.

```
UI
   ↓
Engine API
   ↓
Engine
   ↓
Database
```

- The UI calls engine public APIs and subscribes to engine events. Nothing else.
- The UI must never directly communicate with the database. No Supabase client in a component, no queries in a view.
- The UI must never contain simulation logic. It displays state and dispatches intents; the engine decides what happens.
- The UI must never reach into engine internals. It uses only the published API surface.
- This layering is a permanent architectural rule. A component that imports a database client or mutates engine state directly is broken by definition.

---

## 3. State Management

- **Engines own simulation state.** The source of truth for any game-relevant value is the engine that governs it, not a UI store.
- **UI displays state.** Components read state from engine APIs and render it. They do not cache authoritative copies.
- **UI reacts to events.** When engine state changes, the engine emits an event. The UI subscribes and re-renders. The UI never polls.
- **UI does not own game logic.** A component never decides whether an action is valid, what its result is, or how state changes. It dispatches an intent to the engine and renders the outcome.
- Local UI state (hover, open/closed panels, form input before submit) lives in the component. Anything the simulation cares about lives in the engine.

---

## 4. Component Rules

- **Reusable components.** A component is built to be used in more than one place. If it serves exactly one screen, it is a view, not a component.
- **One responsibility per component.** A component does one thing. A view that mixes listing, editing, and managing is split into separate views.
- **Consistent organization.** Components live in the established folder structure. No parallel UI hierarchies.
- **No duplicated UI logic.** Shared visual or behavioral patterns are extracted into a single component, not copy-pasted.
- Components consume engine APIs through typed interfaces. No untyped props, no implicit contracts.
- A component never reaches across the layering boundary. It talks to the engine API, never the database or engine internals.

---

## 5. Responsive Design

- **Mobile-first.** The UI is designed for the smallest screen first, then enhanced for larger viewports.
- **Tablet support.** Layouts adapt at tablet breakpoints. No broken or cramped views at intermediate sizes.
- **Desktop support.** Larger screens use the available space; they do not simply stretch a mobile layout.
- **Consistent layouts.** The same view behaves predictably across sizes. No entirely different UIs for different devices unless explicitly approved.
- Breakpoints follow the project's established spacing and layout system. No one-off pixel values.

---

## 6. Accessibility

The minimum accessibility baseline, enforced from the first component:

- **Keyboard navigation.** Every interactive element is reachable and operable by keyboard alone. No mouse-only interactions.
- **Semantic HTML.** Use the correct element for the job (`button`, `nav`, `main`, `dialog`). No `div` with an `onClick` pretending to be a button.
- **Sufficient contrast.** Text and interactive elements meet established contrast ratios on every background, including during and after transitions.
- **Readable typography.** Font sizes, line spacing, and weights follow the project's type system. No unreadable micro-text.
- Focus states are always visible. No removing focus outlines without a visible replacement.
- Animations respect reduced-motion preferences. No motion that cannot be suppressed.

---

## 7. Theme Rules

- **Colors.** A comprehensive color system with at least six ramps (primary, secondary, accent, success, warning, error) plus neutrals, each with multiple shades. No ad-hoc color values in components.
- **Spacing.** A consistent 8px spacing system. No arbitrary pixel values.
- **Typography.** A defined type scale with at most three font weights. Line spacing of 150% for body, 120% for headings.
- **Icons.** Lucide React is the icon library. No mixing icon sets without approval.
- **Visual identity.** The theme reflects a medieval fantasy life simulation. No purple, indigo, or violet hues unless explicitly requested. Neutral tones, blues, greens, and professional colors are preferred.
- The theme is defined once and referenced everywhere. Components consume tokens, not raw values.

---

## 8. Performance

- **Avoid unnecessary rendering.** Components re-render only when their state or props change. No global re-renders for local updates.
- **Lazy load where appropriate.** Heavy views and large lists are loaded on demand, not upfront.
- **Keep UI responsive.** The UI thread stays free. Expensive work is delegated to engines, not performed in render paths.
- No premature optimization. Clarity first; performance work is justified by evidence, not intuition.

---

## 9. Documentation

- Every major UI change must update the documentation when the architecture changes.
- New component categories, layout systems, or state patterns are documented before they are used across the project.
- The UI rules and the project's design system are kept in sync. A change to the theme or component conventions updates this document in the same change.
- No UI architecture change lands with stale documentation.

---

## 10. Future Expansion

- UI should support future features without major redesigns.
- The component system is additive. New features compose existing components; they do not fork them.
- The layering rule is permanent. Future features do not gain special permission to bypass the engine API.
- When a UI change is unavoidable, it follows the Decision Rules and Breaking Changes Policy in `01_Project_Rules.md`.
- The UI is never optimized for the current sprint at the expense of the next phase.
