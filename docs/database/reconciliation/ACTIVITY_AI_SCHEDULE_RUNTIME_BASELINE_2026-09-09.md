# Activity / AI / Schedule Runtime Baseline — 2026-09-09

## Runtime scope

The live runtime contains a layered activity/AI/schedule system rather than a single activity table.

### Activity definitions

`activity_definitions` currently contains 9 active activities:

- Eat — need — 30 min — energy cost 2
- Gather Resources — resource — 120 min — energy cost 8
- Personal Care — routine — 30 min — energy cost 2
- Practice Skill — skill — 90 min — energy cost 7
- Rest — recovery — 60 min — energy cost 0
- Sleep — recovery — 480 min — energy cost 0
- Socialize — social — 60 min — energy cost 3
- Travel — travel — 60 min — energy cost 10
- Work — occupation — 240 min — energy cost 15

### Schedule layer

`schedules` belongs to a Life and carries name/status/priority/timezone. `schedule_entries` maps a schedule to an activity definition with start/end minute and priority.

Therefore schedules are per-Life and activities are reusable definitions.

### AI decision layer

`life_ai_profiles` defines an archetype per Life.

`life_ai_goals` stores goal type/title/status/priority/progress/target/current value and source.

`life_ai_decisions` stores candidate/selected activity decisions, scores, reason/context JSON, and optional simulation time/activity instance references.

### AI policy layer

The runtime also contains:

- `ai_activity_need_rules`
- `ai_goal_activity_rules`
- `ai_archetype_activity_policies`
- activity attribute/skill affinity tables
- activity XP policies
- activity completion transitions
- activity interruptions
- activity food/inventory requirements

This indicates an activity-selection architecture where needs, goals, archetype, attributes, skills, and activity rules can influence decisions.

## Population implication

This is compatible with the intended 75–100 Life Village because activities are definitions and schedules are attached per Life. We do not need one custom activity implementation per NPC.

The architecture can therefore scale by creating Life records and assigning/reusing activity definitions, schedules, AI profiles, goals, and policies.

## Important audit boundary

This baseline verifies the runtime schema and current activity catalog. It does **not** prove that a complete autonomous daily simulation loop is currently running or that every 75–100 Life receives a generated schedule automatically.

That execution/orchestration layer must be audited separately.

## Production changes

None.
