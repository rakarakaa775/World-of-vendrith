-- VANDRITH WORLD v0.1
-- Migration 0005: Fix energy trigger execution order.
-- Cost must be applied before recovery.

drop trigger if exists trg_activity_energy_completion on public.activities;
drop trigger if exists trg_activity_energy_consumption on public.activities;

create trigger trg_00_activity_energy_consumption
after update of state on public.activities
for each row
execute function public.consume_activity_energy();

create trigger trg_10_activity_energy_completion
after update of state on public.activities
for each row
execute function public.apply_activity_energy_completion();
