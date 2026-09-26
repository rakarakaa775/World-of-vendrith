-- Complete WORLD library approval for the audited LPC terrain inventory.
-- Runtime consumption remains separately gated.

update public.asset_registry
set status='approved',
    metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
      'library_approval_status','approved',
      'library_approval_basis','source archive exact binary reconciliation + verified license provenance + source geometry audit',
      'runtime_consumption_status','pending'
    ),
    updated_at=now()
where asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  and source_id='ab890ac6-8885-4119-8b69-ca2424cc0008'::uuid;

update public.asset_registry
set status='approved',
    metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
      'library_approval_status','approved',
      'library_approval_basis','source package presence + source-derived transition matrix audit',
      'runtime_consumption_status','pending',
      'runtime_transition_mapping_status','pending'
    ),
    updated_at=now()
where external_key='lpc-revised-terrain-map-v7-derived';
