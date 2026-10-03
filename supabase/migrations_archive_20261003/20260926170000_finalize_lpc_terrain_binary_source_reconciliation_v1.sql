-- Finalize source-archive binary reconciliation for the 59 LPC Terrains binaries.
-- 2026-09-26
-- This migration updates the existing binary verification records only.
-- It does not change asset usage approval, semantic binding, or building data.

update public.asset_binary_verifications b
set
  verification_method = 'git-lfs pointer OID + source archive SHA-256',
  verified_at = now(),
  notes = 'Repository Git LFS OID exactly matches the SHA-256 calculated from the audited source package Asset-library-LPC_Finalized_Review.zip under 02_TILES_AND_TERRAIN/. Result: EXACT_MATCH.',
  metadata = coalesce(b.metadata, '{}'::jsonb) || jsonb_build_object(
    'binary_identity', 'repository-and-source-archive',
    'source_identity', 'verified',
    'source_archive', 'Asset-library-LPC_Finalized_Review.zip',
    'source_archive_path', '02_TILES_AND_TERRAIN/',
    'source_archive_match', 'exact_match',
    'reconciliation_status', 'EXACT_MATCH',
    'reconciliation_checked_count', 59,
    'reconciliation_mismatch_count', 0
  )
where b.repository_path like 'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  and b.verification_status = 'verified';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.asset_binary_verifications
  where repository_path like 'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
    and verification_status = 'verified'
    and metadata->>'source_archive_match' = 'exact_match';

  if v_count <> 59 then
    raise exception 'Expected 59 finalized LPC Terrains binary verification records, found %', v_count;
  end if;
end $$;
