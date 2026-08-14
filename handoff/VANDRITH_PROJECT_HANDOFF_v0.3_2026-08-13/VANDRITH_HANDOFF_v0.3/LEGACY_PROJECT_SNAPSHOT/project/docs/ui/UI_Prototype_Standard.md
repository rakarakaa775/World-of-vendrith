# UI Prototype Standard

> The Vendrith World — the permanent standard for every Visual Prototype in an
> Engine Blueprint.
>
> This document defines the rules every visual prototype must follow. A visual
> prototype is a UI mockup included in every engine blueprint (Chapter 21 of the
> Engine Blueprint Standard v1.0). It describes what the player sees and how they
> interact with the engine's state. It is NOT an implementation.
>
> **Important Rule:** A visual prototype is ONLY a UI mockup. No gameplay. No engine
> logic. No backend. No database. No implementation code.
>
> **Canonical References:**
> - Engine Blueprint Standard: `docs/engine/Engine_Blueprint_Standard_v1.0.md` §21
> - Blueprint Template: `docs/engine/Blueprint_Template.md` §21
> - Blueprint Checklist: `docs/engine/Blueprint_Checklist.md` §21
> - UI Rules: `docs/rules/06_UI_Rules.md`
> - Naming Rules: `docs/rules/08_Naming_Rules.md`
> - Architecture Manifesto: `docs/architecture/Architecture_Manifesto.md`
> - Architecture Principles: `docs/architecture/Architecture_Principles.md`

---

## 1. Purpose

A visual prototype bridges the technical blueprint and the player's experience.
Every engine blueprint must include a visual prototype (Chapter 21) that shows how
the player interacts with that engine's state through the UI.

The visual prototype exists because the player experiences the simulation through
the UI. If the UI is designed after the engine is built, the engine's interface may
not serve the player's needs. By designing the visual prototype alongside the
technical blueprint, the engine's public interface is validated against real player
flows before implementation begins.

A visual prototype is NOT:
- Engine implementation.
- Gameplay logic.
- Backend or database design.
- UI component code.
- A final, pixel-perfect design.

A visual prototype IS:
- A description of what the player sees.
- A description of what the player can do.
- A description of how information flows between the engine and the UI.
- A responsive layout plan (desktop, tablet, mobile).
- An accessibility and theme plan.

---

## 2. Prototype Philosophy

### Design Before Implementation
The visual prototype is created before any UI code is written. It is part of the
blueprint approval process. No engine is implemented until both the technical
blueprint (chapters 1-20) and the visual prototype (chapter 21) are approved.

### UI Is a Thin Layer
Per `docs/rules/06_UI_Rules.md` §2, the UI is a strict layer over the simulation.
The visual prototype respects this: it shows the player engine state and captures
player intents. It never contains simulation logic, database access, or engine
internals.

### Player-Centric Design
The visual prototype answers: what does the player need to see? What does the
player need to do? What feedback does the player need? Every panel, widget, and
button exists to serve the player's understanding of the simulation.

### Responsive by Default
Every visual prototype defines three layouts: desktop, tablet, and mobile. The
simulation does not change between devices; only the layout adapts. Per
`docs/rules/06_UI_Rules.md` §5, the UI is mobile-first.

### Accessibility Is a Baseline
Per `docs/rules/06_UI_Rules.md` §6, accessibility is not a polish step. Every
visual prototype declares its accessibility approach: keyboard navigation, screen
reader support, contrast, focus management, and reduced-motion handling.

---

## 3. Layout Rules

### Grid System
- The layout uses a 12-column grid on desktop, collapsing to fewer columns on
  tablet and mobile.
- The grid follows the 8px spacing system. Gutters and margins are multiples of 8.
- No arbitrary pixel values. All spacing comes from the spacing scale.

### Page Structure
Every visual prototype defines:
- **Header** — navigation, breadcrumbs, global status.
- **Main Content** — the primary information and interaction area.
- **Side Panels** — contextual information, filters, or quick actions (optional).
- **Footer / Status Bar** — persistent status indicators, summary information.

### Visual Hierarchy
- The most important information is the largest and most prominent.
- Secondary information is smaller and less prominent.
- Tertiary information is hidden behind progressive disclosure (tabs, accordions,
  modals).
- No more than three levels of visual hierarchy on a single screen.

### Layout Constraints
- No single screen may stack unrelated features. Per `docs/rules/06_UI_Rules.md` §1,
  each screen does one thing.
- No infinite-scroll walls. Long lists are paginated or virtualized.
- No modals within modals. Progressive disclosure uses one level at a time.

---

## 4. Panel Rules

### Definition
A panel is a bounded region of the screen that groups related information. Panels
are the primary structural unit of the layout.

### Rules
- Every panel has a clear title or label.
- Every panel has a defined data source — an engine query or event that feeds it.
- Panels are self-contained. A panel does not reach into another panel's state.
- Panels can be collapsed or hidden on smaller screens, but never orphaned — if a
  panel is hidden, its information is accessible through navigation.
- Panel borders use the theme's border tokens, not raw colors.

### Panel Types
| Type | Purpose | Example |
|------|---------|---------|
| **Content Panel** | Primary information display | Entity list, world map |
| **Detail Panel** | Shows details of a selected item | Entity attributes, item stats |
| **Action Panel** | Groups related actions | Buttons for an activity |
| **Status Panel** | Aggregated status display | Current time, weather, energy |
| **Navigation Panel** | Screen or section navigation | Tabs, breadcrumbs, sidebar |

---

## 5. Widget Rules

### Definition
A widget is an interactive UI element that displays data and captures player input.
Widgets are the atomic unit of interaction.

### Rules
- Every widget has a clear label or accessible name.
- Every widget declares what it displays and what player action it captures.
- Widgets consume engine state through typed interfaces. No untyped props.
- Widgets do not contain game logic. They dispatch intents to the engine and render
  the result.
- Widgets follow the theme. No ad-hoc styling.

### Widget Types
| Type | Displays | Captures |
|------|----------|----------|
| **Button** | Label, icon | Click / tap |
| **Slider** | Range value | Drag |
| **Toggle** | On / off state | Click / tap |
| **List** | Collection of items | Selection |
| **Table** | Tabular data | Row selection, sort |
| **Card** | Summary of one entity | Click to expand or navigate |
| **Bar** | Progress or fill level | _(display only)_ |
| **Icon** | Status indicator | _(display only)_ |
| **Badge** | Count or status | _(display only)_ |
| **Tooltip** | Contextual help | Hover / focus |
| **Dialog** | Modal interaction | Confirm / cancel |

---

## 6. Card Rules

### Definition
A card is a widget that summarizes a single entity (a character, an item, a quest,
an activity). Cards are the primary way the player scans collections of entities.

### Rules
- A card shows the most important attributes of one entity.
- A card is clickable — it navigates to a detail view or expands in place.
- Cards in the same list use the same layout. No per-card custom layouts.
- Card content is concise. A card is a summary, not a detail page.
- Cards use the theme's card tokens (border, shadow, padding, radius).

### Card Content
A card typically shows:
- Entity name or title.
- Primary attribute (e.g., level, status, energy).
- Secondary attribute (e.g., location, time remaining).
- An icon or thumbnail representing the entity type.
- A status indicator (e.g., active, completed, warning).

---

## 7. Button Rules

### Definition
A button is a widget that triggers a single action. It is the primary way the
player interacts with the simulation.

### Rules
- Every button has a clear text label. No unlabeled icon-only buttons without
  tooltips.
- Every button declares the engine command it dispatches.
- Buttons follow the theme's button tokens (primary, secondary, danger, ghost).
- Primary actions use the primary button style. Secondary actions use secondary or
  ghost. Destructive actions use danger.
- Disabled buttons are visually distinct and explain why they are disabled
  (tooltip or helper text).
- Buttons do not contain game logic. They dispatch an intent; the engine decides.

### Button Hierarchy
| Level | Style | Use |
|-------|-------|-----|
| **Primary** | Filled, accent color | One per screen — the main action |
| **Secondary** | Outlined | Supporting actions |
| **Ghost** | No border or fill | Tertiary actions, navigation |
| **Danger** | Filled, error color | Destructive actions (delete, abandon) |
| **Icon** | Icon only | Compact actions (close, expand) — must have tooltip |

---

## 8. Status Rules

### Definition
A status display aggregates multiple pieces of information into a readable summary.
Status displays keep the player informed without requiring interaction.

### Rules
- Status displays update reactively — when the engine emits an event, the display
  re-renders. The UI never polls.
- Status displays are always visible (in the header, footer, or a persistent
  panel).
- Status displays use indicators (bars, icons, badges) rather than raw text where
  visual scanning is faster than reading.
- Status displays use the theme's status tokens (success, warning, error, info).

### Status Types
| Type | Display | Example |
|------|---------|---------|
| **Bar** | Filled portion of a range | Energy level, health, progress |
| **Badge** | Small count or label | Unread count, active status |
| **Icon** | Symbolic state | Day/night, weather, connection |
| **Text** | Formatted value | Current time, date, tick count |
| **Color** | Background or border tint | Panel tinted by status |

---

## 9. Color Rules

### Color System
Per `docs/rules/06_UI_Rules.md` §7, the project uses a comprehensive color system
with at least six ramps plus neutrals. Visual prototypes reference tokens, not raw
values.

### Token Ramps
| Ramp | Purpose |
|------|---------|
| **Primary** | Main actions, active states, key highlights |
| **Secondary** | Supporting actions, secondary highlights |
| **Accent** | Special emphasis, rare highlights |
| **Success** | Positive outcomes, completed states |
| **Warning** | Caution, approaching limits |
| **Error** | Failures, destructive actions, invalid states |
| **Neutral** | Backgrounds, borders, text, spacing fills |

### Rules
- No ad-hoc color values. Every color comes from a token.
- No purple, indigo, or violet hues unless explicitly requested.
- Text and interactive elements meet established contrast ratios on every
  background, including during and after transitions.
- Dark mode is supported. Every token has a dark-mode variant.
- Colors are meaningful. The same color always means the same status.

---

## 10. Spacing Rules

### 8px System
Per `docs/rules/06_UI_Rules.md` §7, the project uses a consistent 8px spacing
system. All spacing — padding, margins, gaps, gutters — are multiples of 8.

### Spacing Scale
| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Tight gaps within widgets |
| `sm` | 8px | Widget padding, small gaps |
| `md` | 16px | Panel padding, medium gaps |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Major section breaks |
| `2xl` | 48px | Page-level spacing |

### Rules
- No arbitrary pixel values. All spacing comes from the scale.
- Consistent spacing within and across panels.
- Spacing is responsive: smaller screens may reduce spacing by one step, but never
  below the minimum readable spacing.

---

## 11. Typography Rules

### Type System
Per `docs/rules/06_UI_Rules.md` §7, the project uses a defined type scale with at
most three font weights.

### Type Scale
| Level | Use | Weight | Line Height |
|-------|-----|--------|-------------|
| **Heading** | Page and panel titles | Bold | 120% |
| **Subheading** | Section labels | Semibold | 120% |
| **Body** | Default text | Regular | 150% |
| **Caption** | Labels, hints, metadata | Regular | 150% |
| **Mono** | Numeric values, code | Regular | 150% |

### Rules
- At most three font weights: regular, semibold, bold.
- Line spacing of 150% for body, 120% for headings.
- Font sizes follow the established scale. No one-off sizes.
- Sufficient contrast on all backgrounds.
- No unreadable micro-text. Minimum readable size enforced.

---

## 12. Responsive Rules

### Breakpoints
Per `docs/rules/06_UI_Rules.md` §5, the UI is mobile-first.

| Breakpoint | Min Width | Layout |
|------------|-----------|--------|
| **Mobile** | 0px | Single column, stacked panels |
| **Tablet** | 768px | Two columns, collapsible side panels |
| **Desktop** | 1280px | Three columns, full layout |

### Rules
- Mobile-first. The mobile layout is designed first, then enhanced for larger
  screens.
- Tablet support. Layouts adapt at tablet breakpoints. No broken or cramped views
  at intermediate sizes.
- Desktop support. Larger screens use the available space; they do not simply
  stretch a mobile layout.
- Consistent behavior. The same view behaves predictably across sizes. No entirely
  different UIs for different devices unless explicitly approved.
- Panels collapse, stack, or hide on smaller screens — never orphaned.
- Navigation adapts: sidebar on desktop, tabs or hamburger on tablet and mobile.

---

## 13. Accessibility

### Baseline Requirements
Per `docs/rules/06_UI_Rules.md` §6, accessibility is a baseline, not a polish step.

### Requirements
- **Keyboard navigation.** Every interactive element is reachable and operable by
  keyboard alone. No mouse-only interactions.
- **Semantic HTML.** Use the correct element for the job (`button`, `nav`, `main`,
  `dialog`). No `div` with an `onClick` pretending to be a button.
- **Sufficient contrast.** Text and interactive elements meet established contrast
  ratios on every background, including during and after transitions.
- **Readable typography.** Font sizes, line spacing, and weights follow the
  project's type system. No unreadable micro-text.
- **Focus states.** Focus states are always visible. No removing focus outlines
  without a visible replacement.
- **Reduced motion.** Animations respect reduced-motion preferences. No motion
  that cannot be suppressed.
- **Screen reader.** Every panel, widget, and indicator has an accessible name or
  label. Status updates are announced to assistive technology.

### Rules
- Every visual prototype declares its accessibility approach in the Accessibility
  Notes section.
- Accessibility is not deferred. If a layout cannot be made accessible, the layout
  is wrong.

---

## 14. Animation Rules

### Purpose
Animations enhance the player's understanding of state changes. They are not
decorative. Every animation communicates something: a panel opened, a value
changed, a transition occurred.

### Rules
- Animations are subtle. No flashy or distracting motion.
- Animations respect reduced-motion preferences. If the player has reduced motion
  enabled, animations are suppressed or replaced with instant transitions.
- Hover states provide clear visual feedback.
- Panel transitions are smooth and brief (150-300ms).
- State-change feedback is immediate. When the player acts, the UI responds
  visually, even before the engine confirms.
- No animations that block interaction. The player can always act while animations
  play.
- Animations use the theme's motion tokens (duration, easing) where defined.

### Animation Types
| Type | Duration | Use |
|------|----------|-----|
| **Hover** | 100-150ms | Button, card, icon hover feedback |
| **Panel transition** | 200-300ms | Panel open/close, tab switch |
| **State change** | 150-250ms | Value update, status change |
| **Page transition** | 250-400ms | Screen-to-screen navigation |

---

## 15. Prototype Naming

### File Naming
Visual prototypes are included as Chapter 21 of their engine blueprint. They do
not have separate files. The engine blueprint file is:
```
docs/engine/blueprints/<EngineName>_Blueprint.md
```

### Screen Naming
Each screen in the visual prototype is named using the engine's domain:
```
<domain>_<screen_purpose>
```
Examples: `time_dashboard`, `world_map`, `life_entity_detail`, `inventory_list`

### Panel Naming
Panels are named using their function:
```
<domain>_<position>_<function>
```
Examples: `time_header_status`, `life_main_list`, `inventory_side_filters`

### Widget Naming
Widgets are named using their type and function:
```
<domain>_<type>_<function>
```
Examples: `time_button_advance`, `life_bar_energy`, `inventory_list_items`

---

## 16. Future Expansion

### Plugin UI
A plugin engine's visual prototype follows the same standard. A plugin's UI is
registered at the composition root alongside core engine UIs. No core UI is
modified to accommodate a plugin.

### New Screens
New screens are added additively. An existing screen does not need redesign to
accommodate a new one. Navigation is extended, not restructured.

### Theme Variations
Future theme variations (e.g., seasonal themes, accessibility themes) use the same
token system. A new theme is a new set of token values, not a new set of components.

### Multiplayer UI
In a multiplayer future, the UI extends to show other players' state. The layout
adapts: additional panels for social features, shared world state. The core
simulation UI does not change.

### What Does Not Change
- The 8px spacing system.
- The color token system.
- The type scale (three weights, defined line heights).
- The responsive breakpoints (mobile, tablet, desktop).
- The accessibility baseline.
- The rule that visual prototypes contain no gameplay logic, engine logic, backend,
  or database.

---

## Closing Statement

This standard is the permanent contract between every visual prototype and the
project's UI architecture.

Every engine blueprint must include a Visual Prototype chapter (Chapter 21 of the
Engine Blueprint Standard v1.0). The visual prototype shows what the player sees,
what they can do, and how information flows — before any UI code is written. It is
a UI mockup, not an implementation. No gameplay. No engine logic. No backend. No
database.

The standard ensures that every engine's UI is designed alongside its technical
blueprint, that the UI respects the layered architecture, and that the UI is
responsive, accessible, and themed from the first design. It translates the UI
Rules into a concrete, verifiable visual prototype process.

Any change to this standard — adding a rule, changing a breakpoint, modifying the
naming convention — requires Lead Architect approval and an update to this document
before any visual prototype is affected.
