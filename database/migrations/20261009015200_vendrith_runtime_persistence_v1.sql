-- Durable runtime journal, leases, and monotonic checkpoints.
-- All writes are RPC-only; ownership is derived from maps.created_by.

create table if not exists public.world_runtime_leases (
  world_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lease_token uuid not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.world_runtime_mutation_log (
  world_id uuid not null,
  sequence bigint not null,
  mutation_id text not null,
  mutation_type text not null,
  mutation jsonb not null,
  domain_event jsonb not null,
  state_version text not null,
  state_hash text not null check (state_hash ~ '^[0-9a-f]{64}$'),
  tick bigint not null check (tick >= 0),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (world_id, sequence),
  unique (world_id, mutation_id)
);
create index if not exists world_runtime_mutation_log_world_sequence_idx
  on public.world_runtime_mutation_log(world_id, sequence);

create table if not exists public.world_runtime_checkpoints (
  world_id uuid primary key,
  sequence bigint not null check (sequence >= 0),
  tick bigint not null check (tick >= 0),
  state_version text not null,
  state_hash text not null check (state_hash ~ '^[0-9a-f]{64}$'),
  state jsonb not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.world_runtime_leases enable row level security;
alter table public.world_runtime_mutation_log enable row level security;
alter table public.world_runtime_checkpoints enable row level security;
revoke all on public.world_runtime_leases from public, anon, authenticated;
revoke all on public.world_runtime_mutation_log from public, anon, authenticated;
revoke all on public.world_runtime_checkpoints from public, anon, authenticated;

create or replace function public.acquire_world_runtime_lease_v1(
  p_world_id uuid,
  p_lease_token uuid,
  p_duration_seconds integer default 60
)
returns table(acquired boolean, lease_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_row public.world_runtime_leases%rowtype;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then
    raise exception 'authentication required';
  end if;
  if p_world_id is null or p_lease_token is null then raise exception 'world and lease token required'; end if;
  if p_duration_seconds is null or p_duration_seconds < 5 or p_duration_seconds > 120 then raise exception 'lease duration out of range'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then
    raise exception 'world access denied';
  end if;

  insert into public.world_runtime_leases(world_id,user_id,lease_token,expires_at,updated_at)
  values(p_world_id,auth.uid(),p_lease_token,now() + make_interval(secs => p_duration_seconds),now())
  on conflict (world_id) do update
    set user_id = excluded.user_id,
        lease_token = excluded.lease_token,
        expires_at = excluded.expires_at,
        updated_at = now()
    where public.world_runtime_leases.expires_at <= now()
       or (public.world_runtime_leases.user_id = auth.uid()
           and public.world_runtime_leases.lease_token = p_lease_token)
  returning * into v_row;

  if not found then
    return query select false, null::uuid, null::timestamptz;
  else
    return query select true, v_row.lease_token, v_row.expires_at;
  end if;
end;
$$;

create or replace function public.renew_world_runtime_lease_v1(
  p_world_id uuid,
  p_lease_token uuid,
  p_duration_seconds integer default 60
)
returns table(renewed boolean, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_expires timestamptz;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then raise exception 'authentication required'; end if;
  if p_duration_seconds is null or p_duration_seconds < 5 or p_duration_seconds > 120 then raise exception 'lease duration out of range'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then raise exception 'world access denied'; end if;
  update public.world_runtime_leases l
     set expires_at = now() + make_interval(secs => p_duration_seconds), updated_at = now()
   where l.world_id = p_world_id and l.user_id = auth.uid() and l.lease_token = p_lease_token and l.expires_at > now()
  returning l.expires_at into v_expires;
  return query select found, v_expires;
end;
$$;

create or replace function public.append_world_runtime_mutation_batch_v1(
  p_world_id uuid,
  p_mutations jsonb,
  p_lease_token uuid
)
returns table(sequence bigint, mutation_id text, mutation_type text, mutation jsonb, domain_event jsonb, state_version text, state_hash text, tick bigint)
language plpgsql security definer set search_path = '' as $$
declare
  v_lease public.world_runtime_leases%rowtype;
  v_item jsonb;
  v_id text;
  v_type text;
  v_mutation jsonb;
  v_event jsonb;
  v_version text;
  v_hash text;
  v_tick bigint;
  v_existing public.world_runtime_mutation_log%rowtype;
  v_next bigint;
  v_count integer;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then raise exception 'authentication required'; end if;
  if p_world_id is null or p_lease_token is null or jsonb_typeof(p_mutations) is distinct from 'array' then raise exception 'invalid mutation batch'; end if;
  v_count := jsonb_array_length(p_mutations);
  if v_count < 1 or v_count > 100 then raise exception 'mutation batch size out of range'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then raise exception 'world access denied'; end if;

  select * into v_lease from public.world_runtime_leases l
   where l.world_id = p_world_id and l.user_id = auth.uid() and l.lease_token = p_lease_token and l.expires_at > now()
   for update;
  if not found then raise exception 'runtime lease unavailable'; end if;

  if exists (
    select 1 from jsonb_array_elements(p_mutations) x
    group by x->>'mutation_id' having count(*) > 1
  ) then raise exception 'duplicate mutation id in batch'; end if;

  select coalesce(max(l.sequence),0) + 1 into v_next from public.world_runtime_mutation_log l where l.world_id = p_world_id;
  for v_item in select value from jsonb_array_elements(p_mutations) loop
    v_id := v_item->>'mutation_id';
    v_type := v_item->>'mutation_type';
    v_mutation := v_item->'mutation';
    v_event := v_item->'domain_event';
    v_version := v_item->>'state_version';
    v_hash := v_item->>'state_hash';
    v_tick := nullif(v_item->>'tick','')::bigint;
    if coalesce(length(trim(v_id)),0) = 0 or length(v_id) > 200 then raise exception 'invalid mutation id'; end if;
    if coalesce(length(trim(v_type)),0) = 0 or length(v_type) > 100 then raise exception 'invalid mutation type'; end if;
    if jsonb_typeof(v_mutation) is distinct from 'object' or jsonb_typeof(v_event) is distinct from 'object' then raise exception 'mutation and domain event must be objects'; end if;
    if coalesce(length(trim(v_version)),0) = 0 or coalesce(v_hash,'') !~ '^[0-9a-f]{64}$' or v_tick is null or v_tick < 0 then raise exception 'invalid mutation state metadata'; end if;

    select * into v_existing from public.world_runtime_mutation_log l where l.world_id = p_world_id and l.mutation_id = v_id;
    if found then
      if v_existing.mutation_type <> v_type or v_existing.mutation <> v_mutation or v_existing.domain_event <> v_event
         or v_existing.state_version <> v_version or v_existing.state_hash <> v_hash or v_existing.tick <> v_tick then
        raise exception 'mutation idempotency conflict';
      end if;
      return query select v_existing.sequence,v_existing.mutation_id,v_existing.mutation_type,v_existing.mutation,v_existing.domain_event,v_existing.state_version,v_existing.state_hash,v_existing.tick;
    else
      insert into public.world_runtime_mutation_log(world_id,sequence,mutation_id,mutation_type,mutation,domain_event,state_version,state_hash,tick,user_id)
      values(p_world_id,v_next,v_id,v_type,v_mutation,v_event,v_version,v_hash,v_tick,auth.uid())
      returning * into v_existing;
      return query select v_existing.sequence,v_existing.mutation_id,v_existing.mutation_type,v_existing.mutation,v_existing.domain_event,v_existing.state_version,v_existing.state_hash,v_existing.tick;
      v_next := v_next + 1;
    end if;
  end loop;
end;
$$;

create or replace function public.save_world_runtime_checkpoint_v1(
  p_world_id uuid,
  p_sequence bigint,
  p_tick bigint,
  p_state_version text,
  p_state_hash text,
  p_state jsonb,
  p_lease_token uuid
)
returns table(saved boolean, sequence bigint, tick bigint, state_version text, state_hash text)
language plpgsql security definer set search_path = '' as $$
declare
  v_lease public.world_runtime_leases%rowtype;
  v_current public.world_runtime_checkpoints%rowtype;
  v_journal public.world_runtime_mutation_log%rowtype;
  v_state jsonb;
  v_clock jsonb;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then raise exception 'authentication required'; end if;
  if p_world_id is null or p_lease_token is null or p_sequence is null or p_sequence < 1 or p_tick is null or p_tick < 0 then raise exception 'invalid checkpoint metadata'; end if;
  if coalesce(length(trim(p_state_version)),0) = 0 or coalesce(p_state_hash,'') !~ '^[0-9a-f]{64}$' or jsonb_typeof(p_state) is distinct from 'object' then raise exception 'invalid checkpoint state'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then raise exception 'world access denied'; end if;
  select * into v_lease from public.world_runtime_leases l where l.world_id = p_world_id and l.user_id = auth.uid() and l.lease_token = p_lease_token and l.expires_at > now() for update;
  if not found then raise exception 'runtime lease unavailable'; end if;

  v_state := p_state->'state';
  v_clock := v_state->'clock';
  if jsonb_typeof(v_state) is distinct from 'object' or jsonb_typeof(v_clock) is distinct from 'object' or jsonb_typeof(p_state->'entities') is distinct from 'array' then raise exception 'checkpoint snapshot is not canonical'; end if;
  if v_state->>'stateVersion' is distinct from p_state_version then raise exception 'checkpoint state version mismatch'; end if;
  if nullif(v_clock->>'tick','')::bigint is distinct from p_tick then raise exception 'checkpoint tick mismatch'; end if;

  select * into v_journal from public.world_runtime_mutation_log l where l.world_id=p_world_id and l.sequence=p_sequence;
  if not found or v_journal.user_id <> auth.uid() or v_journal.state_version <> p_state_version or v_journal.state_hash <> p_state_hash or v_journal.tick <> p_tick or v_journal.mutation->'state' is distinct from p_state then
    raise exception 'checkpoint does not match committed journal';
  end if;

  select * into v_current from public.world_runtime_checkpoints c where c.world_id=p_world_id for update;
  if found and v_current.sequence > p_sequence then raise exception 'checkpoint downgrade rejected'; end if;
  if found and v_current.sequence = p_sequence then
    if v_current.tick <> p_tick or v_current.state_version <> p_state_version or v_current.state_hash <> p_state_hash or v_current.state <> p_state then raise exception 'checkpoint sequence conflict'; end if;
    return query select true,v_current.sequence,v_current.tick,v_current.state_version,v_current.state_hash;
    return;
  end if;

  insert into public.world_runtime_checkpoints(world_id,sequence,tick,state_version,state_hash,state,user_id,updated_at)
  values(p_world_id,p_sequence,p_tick,p_state_version,p_state_hash,p_state,auth.uid(),now())
  on conflict(world_id) do update set sequence=excluded.sequence,tick=excluded.tick,state_version=excluded.state_version,state_hash=excluded.state_hash,state=excluded.state,user_id=excluded.user_id,updated_at=now()
  where public.world_runtime_checkpoints.sequence < excluded.sequence;
  if not found then raise exception 'checkpoint concurrent update conflict'; end if;
  return query select true,p_sequence,p_tick,p_state_version,p_state_hash;
end;
$$;

create or replace function public.read_latest_world_runtime_checkpoint_v1(p_world_id uuid)
returns table(sequence bigint,tick bigint,state_version text,state_hash text,state jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.maps m where m.world_id=p_world_id and m.created_by=auth.uid()) then raise exception 'world access denied'; end if;
  return query select c.sequence,c.tick,c.state_version,c.state_hash,c.state from public.world_runtime_checkpoints c where c.world_id=p_world_id and c.user_id=auth.uid();
end;
$$;

create or replace function public.read_world_runtime_mutations_v1(p_world_id uuid,p_after_sequence bigint default 0)
returns table(sequence bigint,mutation_id text,mutation_type text,mutation jsonb,domain_event jsonb,state_version text,state_hash text,tick bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then raise exception 'authentication required'; end if;
  if p_after_sequence is null or p_after_sequence < 0 then raise exception 'invalid sequence'; end if;
  if not exists (select 1 from public.maps m where m.world_id=p_world_id and m.created_by=auth.uid()) then raise exception 'world access denied'; end if;
  return query select l.sequence,l.mutation_id,l.mutation_type,l.mutation,l.domain_event,l.state_version,l.state_hash,l.tick
    from public.world_runtime_mutation_log l where l.world_id=p_world_id and l.user_id=auth.uid() and l.sequence > p_after_sequence order by l.sequence;
end;
$$;

-- Replace the lookup function from the earlier partial migration with the same
-- table contract and strict world ownership check.
create or replace function public.read_world_runtime_mutation_by_id_v1(p_world_id uuid,p_mutation_id text)
returns table(sequence bigint,mutation_id text,mutation_type text,mutation jsonb,domain_event jsonb,state_version text,state_hash text,tick bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then raise exception 'authentication required'; end if;
  if p_mutation_id is null or length(trim(p_mutation_id))=0 then raise exception 'mutation id required'; end if;
  if not exists (select 1 from public.maps m where m.world_id=p_world_id and m.created_by=auth.uid()) then raise exception 'world access denied'; end if;
  return query select l.sequence,l.mutation_id,l.mutation_type,l.mutation,l.domain_event,l.state_version,l.state_hash,l.tick
    from public.world_runtime_mutation_log l where l.world_id=p_world_id and l.user_id=auth.uid() and l.mutation_id=p_mutation_id limit 1;
end;
$$;

revoke all on function public.acquire_world_runtime_lease_v1(uuid,uuid,integer) from public, anon;
revoke all on function public.renew_world_runtime_lease_v1(uuid,uuid,integer) from public, anon;
revoke all on function public.append_world_runtime_mutation_batch_v1(uuid,jsonb,uuid) from public, anon;
revoke all on function public.save_world_runtime_checkpoint_v1(uuid,bigint,bigint,text,text,jsonb,uuid) from public, anon;
revoke all on function public.read_latest_world_runtime_checkpoint_v1(uuid) from public, anon;
revoke all on function public.read_world_runtime_mutations_v1(uuid,bigint) from public, anon;
revoke all on function public.read_world_runtime_mutation_by_id_v1(uuid,text) from public, anon;
grant execute on function public.acquire_world_runtime_lease_v1(uuid,uuid,integer) to authenticated;
grant execute on function public.renew_world_runtime_lease_v1(uuid,uuid,integer) to authenticated;
grant execute on function public.append_world_runtime_mutation_batch_v1(uuid,jsonb,uuid) to authenticated;
grant execute on function public.save_world_runtime_checkpoint_v1(uuid,bigint,bigint,text,text,jsonb,uuid) to authenticated;
grant execute on function public.read_latest_world_runtime_checkpoint_v1(uuid) to authenticated;
grant execute on function public.read_world_runtime_mutations_v1(uuid,bigint) to authenticated;
grant execute on function public.read_world_runtime_mutation_by_id_v1(uuid,text) to authenticated;
