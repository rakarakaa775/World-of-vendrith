-- Serialize runtime environment consequences per world.
-- This keeps season, weather state, environment state, and environment clock updates atomic.
create or replace function public.apply_runtime_environment_consequence_v1(
  p_world_id uuid,
  p_season_key text default null,
  p_weather_key text default null,
  p_weather_intensity smallint default null,
  p_conditions jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_state public.world_environment_states%rowtype;
  current_clock public.world_environment_clocks%rowtype;
  season_id uuid;
  weather_id uuid;
  weather_state_id uuid;
  now_at timestamptz := now();
  next_conditions jsonb;
begin
  if p_season_key is null and p_weather_key is null and p_conditions is null then
    raise exception 'Environment consequence must specify season_key, weather_key, or conditions.';
  end if;

  if p_weather_intensity is not null and (p_weather_intensity < 0 or p_weather_intensity > 5) then
    raise exception 'Environment consequence weather_intensity must be between 0 and 5.';
  end if;

  select * into current_clock
  from public.world_environment_clocks
  where world_id = p_world_id
  for update;

  select * into current_state
  from public.world_environment_states
  where world_id = p_world_id
  for update;

  season_id := current_state.season_id;
  if p_season_key is not null then
    select id into season_id
    from public.season_definitions
    where season_key = p_season_key;
    if season_id is null then
      raise exception 'Unknown season_key: %', p_season_key;
    end if;
  elsif season_id is null then
    season_id := current_clock.current_season_id;
  end if;

  if p_weather_key is not null then
    select id into weather_id
    from public.weather_definitions
    where weather_key = p_weather_key;
    if weather_id is null then
      raise exception 'Unknown weather_key: %', p_weather_key;
    end if;
    if season_id is null then
      raise exception 'Weather consequence requires a resolved season.';
    end if;

    if current_state.weather_state_id is not null then
      update public.world_weather_states
      set ends_at = now_at, updated_at = now_at
      where id = current_state.weather_state_id
        and ends_at is null;
    end if;

    insert into public.world_weather_states (
      world_id, weather_id, season_id, started_at, ends_at, intensity, conditions, updated_at
    ) values (
      p_world_id, weather_id, season_id, now_at, null,
      coalesce(p_weather_intensity, 0), '{}'::jsonb, now_at
    ) returning id into weather_state_id;
  else
    weather_state_id := current_state.weather_state_id;
  end if;

  next_conditions := case
    when p_conditions is null then coalesce(current_state.conditions, '{}'::jsonb)
    else p_conditions
  end;

  insert into public.world_environment_states (
    world_id, season_id, weather_state_id, state_started_at, state_ends_at, conditions, updated_at
  ) values (
    p_world_id, season_id, weather_state_id, now_at, null, next_conditions, now_at
  )
  on conflict (world_id) do update set
    season_id = excluded.season_id,
    weather_state_id = excluded.weather_state_id,
    state_started_at = excluded.state_started_at,
    state_ends_at = excluded.state_ends_at,
    conditions = excluded.conditions,
    updated_at = excluded.updated_at;

  if current_clock.world_id is not null then
    update public.world_environment_clocks
    set current_season_id = coalesce(season_id, current_season_id), updated_at = now_at
    where world_id = p_world_id;
  end if;

  return jsonb_build_object(
    'seasonKey', p_season_key,
    'weatherKey', p_weather_key,
    'weatherIntensity', p_weather_intensity,
    'conditions', next_conditions
  );
end;
$$;

revoke all on function public.apply_runtime_environment_consequence_v1(uuid,text,text,smallint,jsonb) from public, anon, authenticated;
grant execute on function public.apply_runtime_environment_consequence_v1(uuid,text,text,smallint,jsonb) to service_role;
