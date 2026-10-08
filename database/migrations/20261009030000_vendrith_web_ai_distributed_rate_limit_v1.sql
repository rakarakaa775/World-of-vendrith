-- Distributed Web AI request limiting for multi-instance deployments.
-- The counter lives outside the exposed public schema and is consumed only
-- through an authenticated, user-bound SECURITY DEFINER RPC.

create schema if not exists private;

create table if not exists private.vendrith_web_ai_rate_limits (
  user_id uuid primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

revoke all on table private.vendrith_web_ai_rate_limits from public, anon, authenticated;

create or replace function public.consume_vendrith_web_ai_rate_limit_v1(
  p_user_id uuid,
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := date_trunc('minute', p_now);
  v_count integer;
  v_retry integer;
begin
  if auth.uid() is null
     or (auth.jwt()->>'is_anonymous') = 'true'
     or auth.uid() <> p_user_id then
    raise exception 'authentication required';
  end if;

  insert into private.vendrith_web_ai_rate_limits(user_id, window_started_at, request_count)
  values (p_user_id, v_window, 1)
  on conflict (user_id) do update
    set window_started_at = excluded.window_started_at,
        request_count = 1
    where private.vendrith_web_ai_rate_limits.window_started_at < excluded.window_started_at
  returning request_count into v_count;

  if v_count is not null then
    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(0, 20 - v_count),
      'retryAfterSeconds', 0
    );
  end if;

  select request_count into v_count
    from private.vendrith_web_ai_rate_limits
   where user_id = p_user_id
   for update;

  if v_count >= 20 then
    v_retry := greatest(1, ceil(extract(epoch from ((v_window + interval '1 minute') - p_now)))::integer);
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retryAfterSeconds', v_retry
    );
  end if;

  update private.vendrith_web_ai_rate_limits
     set request_count = request_count + 1
   where user_id = p_user_id
   returning request_count into v_count;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(0, 20 - v_count),
    'retryAfterSeconds', 0
  );
end;
$$;

revoke all on function public.consume_vendrith_web_ai_rate_limit_v1(uuid,timestamptz) from public, anon;
grant execute on function public.consume_vendrith_web_ai_rate_limit_v1(uuid,timestamptz) to authenticated;
