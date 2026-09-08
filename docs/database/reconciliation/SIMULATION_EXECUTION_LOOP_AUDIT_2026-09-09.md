# Simulation Execution Loop Audit — 2026-09-09

## Finding

The runtime DOES contain an implemented simulation execution/orchestration layer.

The primary entry point is:

`public.vandrith_simulation_tick(p_world_id uuid, p_minutes integer DEFAULT 1) → jsonb`

## Verified execution flow

At each tick the function:

1. locks and advances `simulation_clock`;
2. dispatches due time events;
3. starts scheduled activities for alive Lives in the world;
4. completes due running activities through `complete_activity_safely`;
5. creates scheduled activities from active Life schedules;
6. records Lives whose activities completed;
7. reevaluates AI activity for a bounded number of affected Lives (budget 10 per tick);
8. returns structured tick results including started/created/completed activities and AI processing results.

## AI execution chain

`vandrith_simulation_tick`
→ `reevaluate_life_activity`
→ `select_life_activity`
→ `evaluate_life_activity_candidates`
→ scoring from need / skill / personality / archetype / goal
→ `plan_life_activity_at`
→ `activities` + `life_ai_decisions`

The reevaluation logic can keep the current activity, or interrupt and replace it when a new candidate is sufficiently better or an urgent need requires an override.

## Completion chain

`complete_activity_safely`
→ marks due activity completed using authoritative Life simulation time
→ completion trigger/function applies recovery where appropriate
→ energy history is recorded.

The activity system also contains skill XP awarding and specialized Eat/inventory completion paths.

## Important scalability finding

The tick loop has an explicit AI processing budget of **10 Lives per tick** for completion-triggered reevaluation.

This is important for the intended 75–100 Life Village: the architecture is not simply “run every AI for every Life on every tick”. It already uses bounded processing for one AI phase.

However, this audit does not yet prove that the complete simulation remains performant at 100+ Lives, because no load test was performed.

## Population interaction

This confirms that the missing piece identified earlier is specifically the **population lifecycle/manager**, not the core activity execution engine.

The current architecture can therefore be described as:

`Life creation primitive + Life state + schedules + AI decision + activity execution + simulation tick`

with population scaling/migration still a separate target.

## Production changes

None.
