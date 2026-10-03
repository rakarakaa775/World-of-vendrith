-- Live Supabase migration: 20260923065343 / allow_anon_verified_asset_registry_read_v1
-- Purpose: allow anonymous Map Editor runtime sessions to read only approved
-- asset_registry rows backed by verified, runtime-allowed licenses.
-- Applied to the live project before this source file was synchronized.

create policy "asset license registry runtime verified read anon"
on public.asset_license_registry
for select
to anon
using (
  verification_status = 'verified'
  and usage_status in ('allowed','credit_required')
);

create policy "asset_registry_client_read anon"
on public.asset_registry
for select
to anon
using (
  status = 'approved'
  and exists (
    select 1
    from public.asset_license_registry l
    where l.id = asset_registry.license_registry_id
      and l.verification_status = 'verified'
      and l.usage_status in ('allowed','credit_required')
  )
);
