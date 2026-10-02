-- Asset Library WORLD: LPC terrain semantic binding evidence refresh
-- 2026-09-26
-- Binary provenance is now exact-match for all 59 LPC terrain binaries.
-- This migration does NOT promote binding_status and does NOT change asset_registry.status.

do $$
begin
  update public.world_water_bindings w
  set evidence = coalesce(w.evidence,'{}'::jsonb)
      || jsonb_build_object(
           'binary_verification_status','verified',
           'binary_verification_result','EXACT_MATCH',
           'binary_verification_checked_count',59,
           'binary_verification_mismatch_count',0,
           'source_archive','Asset-library-LPC_Finalized_Review.zip',
           'source_archive_path','02_TILES_AND_TERRAIN/',
           'semantic_verification_status','candidate'
         ),
      notes = 'Filename/source classification retained; repository Git LFS binary and audited source archive are exact-match (59/59). Semantic binding remains candidate pending runtime/visual semantic verification.'
  where exists (
    select 1
    from public.asset_registry ar
    where ar.id=w.asset_id
      and ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  );

  update public.world_transition_bindings w
  set evidence = coalesce(w.evidence,'{}'::jsonb)
      || jsonb_build_object(
           'binary_verification_status','verified',
           'binary_verification_result','EXACT_MATCH',
           'binary_verification_checked_count',59,
           'binary_verification_mismatch_count',0,
           'source_archive','Asset-library-LPC_Finalized_Review.zip',
           'source_archive_path','02_TILES_AND_TERRAIN/',
           'semantic_verification_status','candidate'
         ),
      notes = 'Source classification retained; repository Git LFS binary and audited source archive are exact-match (59/59). Transition binding remains candidate pending tile-region/runtime semantic verification.'
  where exists (
    select 1
    from public.asset_registry ar
    where ar.id=w.asset_id
      and ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  );
end $$;
