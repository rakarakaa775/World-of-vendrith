\set ON_ERROR_STOP on
-- Apply session schema and the durable development proposal/approval/audit boundary.
\ir ../../database/migrations/20261009004400_vendrith_ai_sessions_v1.sql
\ir ../../database/migrations/20261009004600_vendrith_ai_sessions_require_non_anonymous.sql
\ir ../../database/migrations/20261009005000_vendrith_ai_session_world_context_v1.sql
\ir ../../database/migrations/20261009016000_vendrith_development_action_proposals_v1.sql
\ir ../../database/migrations/20261009017000_vendrith_development_action_approval_v1.sql
\ir ../../database/migrations/20261009018000_vendrith_development_execution_v1.sql
\ir ../../database/migrations/20261009022000_vendrith_phase4_final_audit_hardening_v1.sql

-- User one can create/read their own session and append bounded history.
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',false);
insert into public.vendrith_ai_sessions(id,user_id,title,context_type,context_id)
values ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Session contract','playable','30000000-0000-4000-8000-000000000001');
insert into public.vendrith_ai_messages(session_id,user_id,role,content)
select '20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
       case when n % 2 = 0 then 'assistant' else 'user' end, 'contract message ' || n
  from generate_series(1,101) as n;
do $$ begin
  if (select count(*) from public.vendrith_ai_messages where session_id='20000000-0000-4000-8000-000000000001') <> 100 then
    raise exception 'session history cap/append contract failed';
  end if;
  if (select count(*) from public.vendrith_ai_sessions where id='20000000-0000-4000-8000-000000000002') <> 0 then
    raise exception 'session ownership isolation failed';
  end if;
end $$;

-- A different authenticated user must not see the first user's session or messages.
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',false);
do $$ begin
  if (select count(*) from public.vendrith_ai_sessions where id='20000000-0000-4000-8000-000000000001') <> 0 then
    raise exception 'cross-user session read was not isolated';
  end if;
  if (select count(*) from public.vendrith_ai_messages where session_id='20000000-0000-4000-8000-000000000001') <> 0 then
    raise exception 'cross-user message read was not isolated';
  end if;
end $$;
reset role;

-- Approval and execution must be bound to the same owner, proposal, and approval ID;
-- audit rows must be committed alongside each transition.
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',false);
insert into public.vendrith_development_action_proposals(id,user_id,action_type,action,rationale)
values ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','repository_write','{"operation":"test-only"}'::jsonb,'Disposable contract test');
select * from public.approve_vendrith_development_action_v1('40000000-0000-4000-8000-000000000001');
do $$ declare v_approval_id uuid; begin
  select approval_id into v_approval_id from public.vendrith_development_action_proposals where id='40000000-0000-4000-8000-000000000001';
  if v_approval_id is null then raise exception 'approval ID was not persisted'; end if;
  if (select count(*) from public.vendrith_development_action_audit where proposal_id='40000000-0000-4000-8000-000000000001' and decision='approved') <> 1 then
    raise exception 'approval audit row missing';
  end if;
  perform * from public.finalize_vendrith_development_action_v1('40000000-0000-4000-8000-000000000001',v_approval_id,'succeeded','{"contractTest":true}'::jsonb);
  if (select approval_id from public.vendrith_development_action_proposals where id='40000000-0000-4000-8000-000000000001') is not null then
    raise exception 'successful execution did not consume approval binding';
  end if;
  if (select count(*) from public.vendrith_development_execution_audit where proposal_id='40000000-0000-4000-8000-000000000001' and approval_id=v_approval_id and status='succeeded') <> 1 then
    raise exception 'execution audit row missing';
  end if;
end $$;
reset role;
