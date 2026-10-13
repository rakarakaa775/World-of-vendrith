\set ON_ERROR_STOP on
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',false);
do $$
declare
  v_lease uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
  v_other_lease uuid := 'ffffffff-ffff-4fff-8fff-ffffffffffff';
  v_state jsonb := '{"state":{"worldId":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","clock":{"tick":1,"day":1,"hour":0,"minute":0,"season":"spring"},"activeEventIds":[],"stateVersion":"state:1"},"entities":[]}'::jsonb;
  v_state2 jsonb := '{"state":{"worldId":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","clock":{"tick":2,"day":1,"hour":0,"minute":1,"season":"spring"},"activeEventIds":[],"stateVersion":"state:2"},"entities":[]}'::jsonb;
  v_hash text := repeat('a',64);
  v_count integer;
  v_sequence bigint;
  v_saved boolean;
  v_renewed boolean;
begin
  select acquired into v_saved from public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_lease,60);
  if not v_saved then raise exception 'ASSERT: first lease must be acquired'; end if;
  select acquired into v_saved from public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_other_lease,60);
  if v_saved then raise exception 'ASSERT: active lease must not be stolen'; end if;

  select sequence into v_sequence from public.append_world_runtime_mutation_batch_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    jsonb_build_array(jsonb_build_object(
      'mutation_id','mutation-1','mutation_type','test_mutation',
      'mutation',jsonb_build_object('state',v_state),
      'domain_event',jsonb_build_object('type','test.event'),
      'state_version','state:1','state_hash',v_hash,'tick',1
    )),v_lease
  );
  if v_sequence <> 1 then raise exception 'ASSERT: first sequence should be 1, got %',v_sequence; end if;

  select sequence into v_sequence from public.append_world_runtime_mutation_batch_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    jsonb_build_array(jsonb_build_object(
      'mutation_id','mutation-1','mutation_type','test_mutation',
      'mutation',jsonb_build_object('state',v_state),
      'domain_event',jsonb_build_object('type','test.event'),
      'state_version','state:1','state_hash',v_hash,'tick',1
    )),v_lease
  );
  select count(*) into v_count from public.world_runtime_mutation_log where world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  if v_sequence <> 1 or v_count <> 1 then raise exception 'ASSERT: identical retry must be idempotent'; end if;

  begin
    perform * from public.append_world_runtime_mutation_batch_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      jsonb_build_array(jsonb_build_object(
        'mutation_id','mutation-1','mutation_type','test_mutation',
        'mutation',jsonb_build_object('state',v_state),
        'domain_event',jsonb_build_object('type','tampered.event'),
        'state_version','state:1','state_hash',v_hash,'tick',1
      )),v_lease
    );
    raise exception 'ASSERT: mutation id conflict unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: mutation id conflict unexpectedly succeeded' then raise; end if;
    if sqlerrm not like '%mutation idempotency conflict%' then raise; end if;
  end;

  select renewed into v_renewed from public.renew_world_runtime_lease_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_lease,60
  );
  if not v_renewed then raise exception 'ASSERT: active lease renewal failed'; end if;
  select renewed into v_renewed from public.renew_world_runtime_lease_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_other_lease,60
  );
  if v_renewed then raise exception 'ASSERT: wrong token must not renew lease'; end if;

  begin
    perform * from public.append_world_runtime_mutation_batch_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      jsonb_build_array(
        jsonb_build_object('mutation_id','mutation-rollback','mutation_type','test_mutation','mutation',jsonb_build_object('state',v_state),'domain_event',jsonb_build_object('type','test.rollback'),'state_version','state:1','state_hash',repeat('b',64),'tick',1),
        jsonb_build_object('mutation_id','mutation-invalid','mutation_type','test_mutation','mutation',jsonb_build_object('state',v_state),'domain_event',jsonb_build_object('type','test.invalid'),'state_version','state:1','state_hash','not-a-hash','tick',1)
      ),v_lease
    );
    raise exception 'ASSERT: invalid batch unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: invalid batch unexpectedly succeeded' then raise; end if;
  end;
  select count(*) into v_count from public.world_runtime_mutation_log where world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  if v_count <> 1 then raise exception 'ASSERT: failed batch must roll back all rows'; end if;

  begin
    perform * from public.save_world_runtime_checkpoint_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'state:1',v_hash,
      jsonb_set(v_state,'{entities}','[{"id":"tampered"}]'::jsonb),v_lease
    );
    raise exception 'ASSERT: checkpoint snapshot tampering unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: checkpoint snapshot tampering unexpectedly succeeded' then raise; end if;
    if sqlerrm not like '%checkpoint does not match committed journal%' then raise; end if;
  end;

  select saved into v_saved from public.save_world_runtime_checkpoint_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'state:1',v_hash,v_state,v_lease
  );
  if not v_saved then raise exception 'ASSERT: checkpoint save must succeed'; end if;
  select count(*) into v_count from public.read_latest_world_runtime_checkpoint_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') where sequence=1 and state_hash=v_hash;
  if v_count <> 1 then raise exception 'ASSERT: latest checkpoint must round-trip'; end if;
  select count(*) into v_count from public.read_world_runtime_mutations_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',0) where sequence=1 and mutation_id='mutation-1';
  if v_count <> 1 then raise exception 'ASSERT: ordered mutation read failed'; end if;
  select count(*) into v_count from public.read_world_runtime_mutation_by_id_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','mutation-1') where sequence=1;
  if v_count <> 1 then raise exception 'ASSERT: idempotency lookup failed'; end if;

  begin
    perform * from public.save_world_runtime_checkpoint_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,2,'state:2',repeat('c',64),
      '{"state":{"worldId":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","clock":{"tick":2},"stateVersion":"state:2"},"entities":[]}'::jsonb,v_lease
    );
    raise exception 'ASSERT: checkpoint metadata mismatch unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: checkpoint metadata mismatch unexpectedly succeeded' then raise; end if;
  end;

  perform * from public.append_world_runtime_mutation_batch_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    jsonb_build_array(jsonb_build_object(
      'mutation_id','mutation-2','mutation_type','test_mutation',
      'mutation',jsonb_build_object('state',v_state2),
      'domain_event',jsonb_build_object('type','test.event.2'),
      'state_version','state:2','state_hash',repeat('b',64),'tick',2
    )),v_lease
  );
  select saved into v_saved from public.save_world_runtime_checkpoint_v1(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',2,2,'state:2',repeat('b',64),v_state2,v_lease
  );
  if not v_saved then raise exception 'ASSERT: newer checkpoint must save'; end if;
  begin
    perform * from public.save_world_runtime_checkpoint_v1(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,1,'state:1',v_hash,v_state,v_lease
    );
    raise exception 'ASSERT: checkpoint downgrade unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: checkpoint downgrade unexpectedly succeeded' then raise; end if;
    if sqlerrm not like '%checkpoint downgrade rejected%' then raise; end if;
  end;

  update public.world_runtime_leases set expires_at=now()-interval '1 second' where world_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  select acquired into v_saved from public.acquire_world_runtime_lease_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_other_lease,30);
  if not v_saved then raise exception 'ASSERT: expired lease must be replaceable'; end if;
end $$;

-- A different authenticated owner cannot read the first owner's runtime data.
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false}',false);
do $$
begin
  begin
    perform * from public.read_world_runtime_mutations_v1('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',0);
    raise exception 'ASSERT: cross-owner read unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'ASSERT: cross-owner read unexpectedly succeeded' then raise; end if;
    if sqlerrm not like '%world access denied%' then raise; end if;
  end;
end $$;

select 'runtime persistence assertions passed' as result;
