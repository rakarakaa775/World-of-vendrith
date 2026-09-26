-- Promote only the verified LPC v7 base terrain runtime path.
-- Transition tiles remain pending because the source four-corner matrix has not been
-- converted into an approved 8-neighbor runtime adapter.

update public.asset_sources
set audit_status='approved',
    metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
      'audit_status','approved',
      'audit_basis','official OpenGameArt source + repository/source archive binary reconciliation + source geometry/visual semantic audit',
      'source_url','https://opengameart.org/content/lpc-terrains',
      'binary_reconciliation','59/59 exact match'
    ),
    updated_at=now()
where slug='lpc-terrains';

update public.asset_registry
set status='approved',
    metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
      'runtime_approval_status','approved',
      'runtime_approval_basis','source-verified v7 base terrain mapping',
      'runtime_tileset_id','lpc-revised-terrain-v7-derived',
      'runtime_region_verified',true,
      'runtime_region_size','32x32',
      'semantic_runtime_status','verified'
    ),
    updated_at=now()
where external_key='lpc-revised-terrain-v7-derived';

update public.asset_binding_candidates
set candidate_status='approved',
    reviewer_note='Approved source-derived base terrain runtime binding after source, license, binary, visual, and 32x32 region verification. Transition mappings remain separate and unapproved.',
    evidence = evidence || jsonb_build_object(
      'approval_status','approved',
      'approval_basis','source_verified_base_terrain',
      'semantic_runtime_status','verified',
      'binary_verification_result','EXACT_MATCH'
    ),
    updated_at=now()
where asset_id='3d951ba9-f14d-40e7-bf14-17c191f77bb6'::uuid
  and transition_type='full'
  and neighbor_mask=255;
