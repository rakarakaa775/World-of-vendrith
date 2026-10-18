
-- Pass27 disposable reproduction fixture. Current hosted RPC definitions, fetched read-only.
DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
CREATE TABLE public.worlds (id uuid PRIMARY KEY, name text NOT NULL);
CREATE TABLE public.maps (id uuid PRIMARY KEY, world_id uuid NOT NULL, created_by uuid, map_type text NOT NULL);
CREATE TABLE public.world_runtime_leases (
 world_id uuid PRIMARY KEY REFERENCES public.worlds(id) ON DELETE CASCADE,
 holder_id uuid NOT NULL, lease_token uuid NOT NULL, lease_until timestamptz NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.world_runtime_mutation_log (
 id uuid NOT NULL DEFAULT gen_random_uuid(), world_id uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
 sequence bigint NOT NULL, mutation_id text NOT NULL, mutation_type text NOT NULL, mutation jsonb NOT NULL,
 domain_event jsonb NOT NULL, state_version text NOT NULL, state_hash text NOT NULL, tick bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(world_id, sequence), UNIQUE(world_id, mutation_id)
);
CREATE TABLE public.world_runtime_checkpoints (
 id uuid NOT NULL DEFAULT gen_random_uuid(), world_id uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
 sequence bigint NOT NULL, tick bigint NOT NULL, state_version text NOT NULL, state_hash text NOT NULL,
 state jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(id), UNIQUE(world_id, sequence)
);
CREATE OR REPLACE FUNCTION public.acquire_world_runtime_lease_v1(p_world_id uuid, p_lease_token uuid, p_duration_seconds integer DEFAULT 15)
 RETURNS TABLE(acquired boolean, lease_until timestamp with time zone, holder_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_row public.world_runtime_leases%rowtype;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_lease_token is null then raise exception 'lease token is required'; end if;
 if p_duration_seconds < 5 or p_duration_seconds > 60 then raise exception 'lease duration must be between 5 and 60 seconds'; end if;
 perform 1 from public.worlds where id=p_world_id for update;
 if not found then raise exception 'world not found: %',p_world_id; end if;
 insert into public.world_runtime_leases(world_id,holder_id,lease_token,lease_until,updated_at)
 values(p_world_id,auth.uid(),p_lease_token,now()+make_interval(secs=>p_duration_seconds),now())
 on conflict(world_id) do update set holder_id=excluded.holder_id,lease_token=excluded.lease_token,lease_until=excluded.lease_until,updated_at=now()
 where public.world_runtime_leases.lease_until <= now() or (public.world_runtime_leases.holder_id=auth.uid() and public.world_runtime_leases.lease_token=p_lease_token)
 returning * into v_row;
 if found then return query select true,v_row.lease_until,v_row.holder_id; return; end if;
 select * into v_row from public.world_runtime_leases where world_id=p_world_id;
 return query select false,v_row.lease_until,v_row.holder_id;
end;$function$
;

CREATE OR REPLACE FUNCTION public.append_world_runtime_mutation_batch_v1(p_world_id uuid, p_mutations jsonb, p_lease_token uuid)
 RETURNS TABLE(sequence bigint, mutation jsonb, domain_event jsonb, state_version text, state_hash text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_lease public.world_runtime_leases%rowtype;
  v_previous public.world_runtime_mutation_log%rowtype;
  v_existing public.world_runtime_mutation_log%rowtype;
  v_item jsonb;
  v_index integer := 0;
  v_existing_count integer := 0;
  v_item_count integer;
  v_sequence bigint;
  v_expected_version text;
  v_mutation_id text;
  v_mutation_type text;
  v_mutation jsonb;
  v_domain_event jsonb;
  v_state_version text;
  v_state_hash text;
  v_tick bigint;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_lease_token is null then raise exception 'lease token is required'; end if;
  if p_mutations is null or jsonb_typeof(p_mutations) <> 'array' then
    raise exception 'mutations must be a JSON array';
  end if;

  v_item_count := jsonb_array_length(p_mutations);
  if v_item_count = 0 then raise exception 'mutation batch must not be empty'; end if;

  -- Canonical lock order: world row first, lease row second.
  perform 1 from public.worlds where id = p_world_id for update;
  if not found then raise exception 'world not found: %', p_world_id; end if;

  select * into v_lease
    from public.world_runtime_leases
   where world_id = p_world_id
     and holder_id = auth.uid()
     and lease_token = p_lease_token
     and lease_until > now()
   for update;
  if not found then raise exception 'runtime authority lease is missing or expired'; end if;

  -- Validate the complete batch before inserting anything.
  for v_item in select value from jsonb_array_elements(p_mutations)
  loop
    v_index := v_index + 1;
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'mutation batch item % must be an object', v_index;
    end if;

    v_mutation_id := v_item->>'mutation_id';
    v_mutation_type := v_item->>'mutation_type';
    v_mutation := v_item->'mutation';
    v_domain_event := v_item->'domain_event';
    v_state_version := v_item->>'state_version';
    v_state_hash := v_item->>'state_hash';
    v_tick := (v_item->>'tick')::bigint;

    if v_mutation_id is null or btrim(v_mutation_id) = '' then raise exception 'mutation_id is required at batch item %', v_index; end if;
    if v_mutation_type is null or btrim(v_mutation_type) = '' then raise exception 'mutation_type is required at batch item %', v_index; end if;
    if v_mutation is null or jsonb_typeof(v_mutation) <> 'object' then raise exception 'mutation is required at batch item %', v_index; end if;
    if v_domain_event is null or jsonb_typeof(v_domain_event) <> 'object' then raise exception 'domain_event is required at batch item %', v_index; end if;
    if v_state_version is null or btrim(v_state_version) = '' then raise exception 'state_version is required at batch item %', v_index; end if;
    if v_state_hash is null or btrim(v_state_hash) = '' then raise exception 'state_hash is required at batch item %', v_index; end if;
    if v_tick is null or v_tick < 0 then raise exception 'tick must be non-negative at batch item %', v_index; end if;
    if v_mutation->'context'->>'worldId' is distinct from p_world_id::text then raise exception 'mutation context world mismatch at batch item %', v_index; end if;
    if v_domain_event->>'worldId' is distinct from p_world_id::text then raise exception 'domain event world mismatch at batch item %', v_index; end if;
    if v_domain_event->>'mutationId' is distinct from v_mutation_id then raise exception 'domain event mutation mismatch at batch item %', v_index; end if;
    if v_domain_event->>'stateVersion' is distinct from v_state_version then raise exception 'domain event state version mismatch at batch item %', v_index; end if;

    if exists (
      select 1
        from public.world_runtime_mutation_log
       where world_id = p_world_id
         and mutation_id = v_mutation_id
    ) then
      v_existing_count := v_existing_count + 1;
    end if;
  end loop;

  if v_existing_count > 0 and v_existing_count < v_item_count then
    raise exception 'mutation batch partially exists; retry the complete batch or use a new batch identity';
  end if;

  if v_existing_count = v_item_count then
    -- Idempotent retry: return the already committed batch only after verifying every row.
    for v_item in select value from jsonb_array_elements(p_mutations)
    loop
      v_mutation_id := v_item->>'mutation_id';
      v_mutation_type := v_item->>'mutation_type';
      v_mutation := v_item->'mutation';
      v_domain_event := v_item->'domain_event';
      v_state_version := v_item->>'state_version';
      v_state_hash := v_item->>'state_hash';
      v_tick := (v_item->>'tick')::bigint;

      select * into v_existing
        from public.world_runtime_mutation_log
       where world_id = p_world_id and mutation_id = v_mutation_id
       limit 1;

      if v_existing.mutation_type <> v_mutation_type
         or v_existing.mutation <> v_mutation
         or v_existing.domain_event <> v_domain_event
         or v_existing.state_version <> v_state_version
         or v_existing.state_hash <> v_state_hash
         or v_existing.tick <> v_tick then
        raise exception 'mutation id already journaled with different payload: %', v_mutation_id;
      end if;

      sequence := v_existing.sequence;
      mutation := v_existing.mutation;
      domain_event := v_existing.domain_event;
      state_version := v_existing.state_version;
      state_hash := v_existing.state_hash;
      return next;
    end loop;
    return;
  end if;

  select * into v_previous
    from public.world_runtime_mutation_log
   where world_id = p_world_id
   order by sequence desc
   limit 1;

  v_expected_version := coalesce(v_previous.state_version, null);

  v_index := 0;
  for v_item in select value from jsonb_array_elements(p_mutations)
  loop
    v_index := v_index + 1;
    v_mutation_id := v_item->>'mutation_id';
    v_mutation_type := v_item->>'mutation_type';
    v_mutation := v_item->'mutation';
    v_domain_event := v_item->'domain_event';
    v_state_version := v_item->>'state_version';
    v_state_hash := v_item->>'state_hash';
    v_tick := (v_item->>'tick')::bigint;

    if v_expected_version is not null
       and v_mutation->>'expectedStateVersion' is distinct from v_expected_version then
      raise exception 'mutation expected state version does not match batch journal predecessor at item %', v_index;
    end if;

    if v_previous.tick is not null and v_tick < v_previous.tick then
      raise exception 'mutation tick cannot move backwards at batch item %', v_index;
    end if;

    v_sequence := coalesce(v_previous.sequence, 0) + 1;

    insert into public.world_runtime_mutation_log(
      world_id, sequence, mutation_id, mutation_type, mutation,
      domain_event, state_version, state_hash, tick
    ) values (
      p_world_id, v_sequence, v_mutation_id, v_mutation_type, v_mutation,
      v_domain_event, v_state_version, v_state_hash, v_tick
    );

    sequence := v_sequence;
    mutation := v_mutation;
    domain_event := v_domain_event;
    state_version := v_state_version;
    state_hash := v_state_hash;
    return next;

    v_previous.sequence := v_sequence;
    v_previous.state_version := v_state_version;
    v_previous.tick := v_tick;
    v_expected_version := v_state_version;
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.read_latest_world_runtime_checkpoint_v1(p_world_id uuid)
 RETURNS TABLE(sequence bigint, tick bigint, state_version text, state_hash text, state jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (select 1 from public.worlds where id = p_world_id) then raise exception 'world not found: %', p_world_id; end if;
  return query select c.sequence, c.tick, c.state_version, c.state_hash, c.state
  from public.world_runtime_checkpoints c where c.world_id = p_world_id order by c.sequence desc limit 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.read_world_runtime_mutation_by_id_v1(p_world_id uuid, p_mutation_id text)
 RETURNS TABLE(sequence bigint, mutation_id text, mutation_type text, mutation jsonb, domain_event jsonb, state_version text, state_hash text, tick bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then raise exception 'authentication required'; end if;
  if p_mutation_id is null or length(trim(p_mutation_id)) = 0 then raise exception 'mutation id required'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then
    raise exception 'world access denied';
  end if;
  return query
    select l.sequence,l.mutation_id,l.mutation_type,l.mutation,l.domain_event,
           l.state_version,l.state_hash,l.tick
      from public.world_runtime_mutation_log l
     where l.world_id=p_world_id and l.mutation_id=p_mutation_id
     limit 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.read_world_runtime_mutations_v1(p_world_id uuid, p_after_sequence bigint DEFAULT 0)
 RETURNS TABLE(sequence bigint, mutation jsonb, domain_event jsonb, state_version text, state_hash text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_after_sequence < 0 then raise exception 'after sequence must be non-negative'; end if;
  if not exists (select 1 from public.worlds where id = p_world_id) then raise exception 'world not found: %', p_world_id; end if;
  return query select l.sequence, l.mutation, l.domain_event, l.state_version, l.state_hash
  from public.world_runtime_mutation_log l where l.world_id = p_world_id and l.sequence > p_after_sequence order by l.sequence asc;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.renew_world_runtime_lease_v1(p_world_id uuid, p_lease_token uuid, p_duration_seconds integer DEFAULT 15)
 RETURNS TABLE(renewed boolean, lease_until timestamp with time zone, holder_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_row public.world_runtime_leases%rowtype;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_lease_token is null then raise exception 'lease token is required'; end if;
 if p_duration_seconds < 5 or p_duration_seconds > 60 then raise exception 'lease duration must be between 5 and 60 seconds'; end if;
 update public.world_runtime_leases set lease_until=now()+make_interval(secs=>p_duration_seconds),updated_at=now()
 where world_id=p_world_id and holder_id=auth.uid() and lease_token=p_lease_token and lease_until>now() returning * into v_row;
 if found then return query select true,v_row.lease_until,v_row.holder_id; return; end if;
 select * into v_row from public.world_runtime_leases where world_id=p_world_id;
 return query select false,v_row.lease_until,v_row.holder_id;
end;$function$
;

CREATE OR REPLACE FUNCTION public.save_world_runtime_checkpoint_v1(p_world_id uuid, p_sequence bigint, p_tick bigint, p_state_version text, p_state_hash text, p_state jsonb, p_lease_token uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_existing public.world_runtime_checkpoints%rowtype;
  v_lease public.world_runtime_leases%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_lease_token is null then raise exception 'lease token is required'; end if;
  if p_sequence < 0 then raise exception 'sequence must be non-negative'; end if;
  if p_tick < 0 then raise exception 'tick must be non-negative'; end if;
  if p_state_version is null or btrim(p_state_version) = '' then raise exception 'state_version is required'; end if;
  if p_state_hash is null or btrim(p_state_hash) = '' then raise exception 'state_hash is required'; end if;
  if p_state is null then raise exception 'state is required'; end if;
  if p_state->>'worldId' is distinct from p_world_id::text then raise exception 'checkpoint state world mismatch'; end if;
  if p_state->>'stateVersion' is distinct from p_state_version then raise exception 'checkpoint state version mismatch'; end if;
  if (p_state->>'tick')::bigint is distinct from p_tick then raise exception 'checkpoint tick mismatch'; end if;
  perform 1 from public.worlds where id = p_world_id for update;
  if not found then raise exception 'world not found: %', p_world_id; end if;
  select * into v_lease from public.world_runtime_leases
   where world_id = p_world_id and holder_id = auth.uid() and lease_token = p_lease_token and lease_until > now()
   for update;
  if not found then raise exception 'runtime authority lease is missing or expired'; end if;
  if p_sequence > coalesce((select max(sequence) from public.world_runtime_mutation_log where world_id = p_world_id), 0) then raise exception 'checkpoint sequence is ahead of mutation journal'; end if;
  if p_sequence > 0 and not exists (
    select 1 from public.world_runtime_mutation_log where world_id = p_world_id and sequence = p_sequence
      and state_version = p_state_version and state_hash = p_state_hash and tick = p_tick
  ) then raise exception 'checkpoint does not match the journal entry at sequence %', p_sequence; end if;
  select * into v_existing from public.world_runtime_checkpoints where world_id = p_world_id and sequence = p_sequence limit 1;
  if found then
    if v_existing.tick <> p_tick or v_existing.state_version <> p_state_version or v_existing.state_hash <> p_state_hash or v_existing.state <> p_state then raise exception 'checkpoint already exists with different state at sequence %', p_sequence; end if;
    return;
  end if;
  insert into public.world_runtime_checkpoints(world_id, sequence, tick, state_version, state_hash, state)
  values (p_world_id, p_sequence, p_tick, p_state_version, p_state_hash, p_state);
end;
$function$
;
