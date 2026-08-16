-- VANDRITH WORLD v0.1
-- Migration 0004: Energy History Recovery Events v1.0
-- Purpose: record recovery effects separately from activity energy cost.

create or replace function public.apply_activity_energy_completion()
returns trigger
language plpgsql
as $$
declare
  recovery numeric := 0;
  fatigue_delta numeric := 0;
  food_recovery numeric := 0;
  food_fatigue numeric := 0;
  old_energy numeric;
  new_energy numeric;
  old_state text;
  new_state text;
  rule_type text;
  activity_name text;
begin
  if new.state = 'completed' and old.state is distinct from 'completed' then

    select lower(ad.name)
    into activity_name
    from public.activity_definitions ad
    where ad.id = new.activity_definition_id;

    rule_type := case
      when activity_name in ('eat','eating','makan') then 'eat'
      when activity_name in ('rest','istirahat') then 'rest'
      when activity_name in ('sleep','tidur') then 'sleep'
      else null
    end;

    if rule_type is null then
      return new;
    end if;

    if rule_type = 'eat' then
      select
        coalesce(sum(afc.energy_recovery),0),
        coalesce(sum(afc.fatigue_delta),0)
      into food_recovery, food_fatigue
      from public.activity_food_consumptions afc
      where afc.activity_id = new.id;

      recovery := food_recovery;
      fatigue_delta := food_fatigue;
    else
      select
        coalesce(er.recovery_amount,0),
        coalesce(er.fatigue_delta,0)
      into recovery, fatigue_delta
      from public.energy_recovery_rules er
      where lower(er.activity_type) = rule_type
        and er.active = true;
    end if;

    if recovery = 0 and fatigue_delta = 0 then
      return new;
    end if;

    select current_energy, state
    into old_energy, old_state
    from public.life_energy
    where life_id = new.actor_life_id
    for update;

    if old_energy is null then
      return new;
    end if;

    new_energy := least(
      (select max_energy
       from public.life_energy
       where life_id = new.actor_life_id),
      greatest(0, old_energy + recovery)
    );

    update public.life_energy
    set
      current_energy = new_energy,
      fatigue = greatest(0, fatigue + fatigue_delta),
      updated_at = now()
    where life_id = new.actor_life_id
    returning state into new_state;

    insert into public.energy_history (
      life_id,
      timestamp,
      old_state,
      new_state,
      cause
    )
    values (
      new.actor_life_id,
      coalesce(new.end_time, now()),
      old_state,
      new_state,
      'activity_recovery:' || new.id::text || ':type=' || rule_type
    );

  end if;

  return new;
end;
$$;

comment on function public.apply_activity_energy_completion() is
'Applies post-completion recovery and records a separate energy_history recovery event. Cost remains handled by consume_activity_energy().';
