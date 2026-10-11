-- Compatibility bootstrap for the reconstructed schema in a disposable PostgreSQL 17 database.
-- Never run against hosted Supabase or production.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end
$$;

create schema if not exists auth;
create schema if not exists extensions;
create schema if not exists vault;

-- The reconstructed schema refers to auth.users only by its stable primary key.
-- Keep this compatibility table deliberately minimal and disposable.
create table if not exists auth.users (id uuid primary key);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
