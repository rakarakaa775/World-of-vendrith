-- VANDRITH WORLD v0.1
-- Energy Recovery v1.0
-- Migration 0003: Fix Eat -> Food Recovery Mapping
-- Status: APPLIED IN SUPABASE / REPOSITORY SYNC PENDING

create or replace function apply_activity_energy_completion()
returns trigger
language plpgsql
as $$
declare
  cost numeric := 0;
  recovery numeric := 0;
  fatigue_delta numeric := 0;
  old_energy numeric;
  new_energy numeric;
  old_state text;
  new_state text;
  rule_type text;
  activity_name text;
begin
  if new.state = 'completed'
     and old.state is distinct from 'completed' then

    select coalesce(ad.energy_cost, 0), lower(ad.name)
    into cost, activity_name
    from public.activity_definitions ad
    where ad.id = new.activity_definition_id;

    rule_type := case
      when activity_name in ('eat', 'eating', 'makan') then 'eat'
      when activity_name in ('rest', 'istirahat') then 'rest'
      when activity_name in ('sleep', 'tidur') then 'sleep'
      else null
    end;

    if rule_type is not null then
      select coalesce(er.recovery_amount, 0), coalesce(er.fatigue_delta, 0)
      into recovery, fatigue_delta
      from public.energy_recovery_rules er
      where lower(er.activity_type) = rule_type and er.active = true;
    end if;

    select le.current_energy, le.state
    into old_energy, old_state
    from public.life_energy le
    where le.life_id = new.actor_life_id
    for update;

    if old_energy is null then
      return new;
    end if;

    if rule_type = 'eat'
       and not exists (
         select 1 from public.activity_food_consumptions afc
         where afc.activity_id = new.id
       ) then
      recovery := 0;
      fatigue_delta := 0;
    end if;

    new_energy := least(
      (select max_energy from public.life_energy where life_id = new.actor_life_id),
      greatest(0, old_energy - cost + recovery)
    );

    update public.life_energy
    set current_energy = new_energy,
        fatigue = greatest(0, fatigue + fatigue_delta),
        updated_at = now()
    where life_id = new.actor_life_id
    returning state into new_state;

    insert into public.energy_history (
      life_id, timestamp, old_state, new_state, cause
    )
    values (
      new.actor_life_id, now(), old_state, new_state,
      'activity_completed:' || new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_activity_energy_completion on public.activities;

create trigger trg_activity_energy_completion
after update of state on public.activities
for each row
execute function apply_activity_energy_completion();
