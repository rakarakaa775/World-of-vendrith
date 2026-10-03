-- Align Asset Library registry metadata with the completed 59-file binary reconciliation.
-- 2026-09-26
-- Deliberately leaves asset_registry.status, semantic bindings, and usage approval unchanged.

update public.asset_registry
set metadata = coalesce(metadata, '{}'::jsonb)
  || jsonb_build_object(
    'binary_verification_status','verified',
    'binary_verification_result','EXACT_MATCH',
    'binary_verification_checked_count',59,
    'binary_verification_mismatch_count',0,
    'binary_source_archive','Asset-library-LPC_Finalized_Review.zip',
    'binary_source_path','02_TILES_AND_TERRAIN/'
  ),
  updated_at = now()
where asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.asset_registry
  where asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
    and metadata->>'binary_verification_status' = 'verified'
    and metadata->>'binary_verification_result' = 'EXACT_MATCH';

  if v_count <> 59 then
    raise exception 'Expected 59 LPC Terrains registry records marked binary verified, found %', v_count;
  end if;
end $$;