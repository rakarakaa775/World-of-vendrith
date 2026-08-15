-- VANDRITH WORLD v0.1
-- Energy Recovery v1.0 Foundation
-- Status: RECOVERY VALUES PENDING CANON LOCK

create table if not exists energy_recovery_rules (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null unique,
  recovery_amount numeric not null check (recovery_amount >= 0),
  fatigue_delta numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into energy_recovery_rules
  (activity_type, recovery_amount, fatigue_delta, metadata)
values
  ('eat', 0, 0, '{"status":"placeholder","rule_state":"pending_canon_value"}'),
  ('rest', 0, 0, '{"status":"placeholder","rule_state":"pending_canon_value"}'),
  ('sleep', 0, 0, '{"status":"placeholder","rule_state":"pending_canon_value"}')
on conflict (activity_type) do nothing;

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
begin
  if new.state = 'completed'
     and old.state is distinct from 'completed' then

    select
      coalesce(ad.energy_cost, 0),
      ad.activity_type
    into cost, rule_type
    from activity_definitions ad
    where ad.id = new.activity_definition_id;

    select
      coalesce(er.recovery_amount, 0),
      coalesce(er.fatigue_delta, 0)
    into recovery, fatigue_delta
    from energy_recovery_rules er
    where lower(er.activity_type) = lower(rule_type)
      and er.active = true;

    select current_energy, state
    into old_energy, old_state
    from life_energy
    where life_id = new.actor_life_id
    for update;

    if old_energy is null then
      return new;
    end if;

    new_energy := least(
      (select max_energy
       from life_energy
       where life_id = new.actor_life_id),
      greatest(0, old_energy - cost + recovery)
    );

    update life_energy
    set
      current_energy = new_energy,
      fatigue = greatest(0, fatigue + fatigue_delta),
      updated_at = now()
    where life_id = new.actor_life_id
    returning state into new_state;

    insert into energy_history (
      life_id,
      timestamp,
      old_state,
      new_state,
      cause
    )
    values (
      new.actor_life_id,
      now(),
      old_state,
      new_state,
      'activity_completed:' || new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_activity_energy_completion
on activities;

create trigger trg_activity_energy_completion
after update of state on activities
for each row
execute function apply_activity_energy_completion();
