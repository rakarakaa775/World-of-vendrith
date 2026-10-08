drop policy if exists vendrith_ai_sessions_select_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_select_own on public.vendrith_ai_sessions for select to authenticated
using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');

drop policy if exists vendrith_ai_sessions_insert_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_insert_own on public.vendrith_ai_sessions for insert to authenticated
with check ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');

drop policy if exists vendrith_ai_sessions_update_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_update_own on public.vendrith_ai_sessions for update to authenticated
using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true')
with check ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');

drop policy if exists vendrith_ai_sessions_delete_own on public.vendrith_ai_sessions;
create policy vendrith_ai_sessions_delete_own on public.vendrith_ai_sessions for delete to authenticated
using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');

drop policy if exists vendrith_ai_messages_select_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_select_own on public.vendrith_ai_messages for select to authenticated
using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');

drop policy if exists vendrith_ai_messages_insert_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_insert_own on public.vendrith_ai_messages for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  and exists (select 1 from public.vendrith_ai_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
);

drop policy if exists vendrith_ai_messages_delete_own on public.vendrith_ai_messages;
create policy vendrith_ai_messages_delete_own on public.vendrith_ai_messages for delete to authenticated
using ((select auth.uid()) = user_id and (select auth.jwt()->>'is_anonymous') is distinct from 'true');