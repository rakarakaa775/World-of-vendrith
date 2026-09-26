-- Asset Library WORLD: LPC terrain visual semantic audit v1
-- 2026-09-26
-- Evidence-only checkpoint from direct visual inspection of the audited source PNGs.
-- Does NOT promote binding_status or asset_registry.status.
-- Does NOT define runtime tile_region/tileset_id because those require engine/source mapping evidence.

update public.world_water_bindings w
set evidence = coalesce(w.evidence,'{}'::jsonb)
  || jsonb_build_object(
    'visual_source_audit_status','observed_consistent',
    'visual_source_audit_scope','22 LPC water binding PNGs',
    'visual_source_archive','Asset-library-LPC_Finalized_Review.zip',
    'visual_source_path','02_TILES_AND_TERRAIN/',
    'semantic_runtime_status','not_verified'
  ),
notes='Visual audit of the source PNG is consistent with the recorded water-state classification. Binary identity is EXACT_MATCH 59/59. Runtime flow direction/strength remain undefined; binding remains candidate.'
where exists (
  select 1 from public.asset_registry ar
  where ar.id=w.asset_id
    and ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
);

update public.world_transition_bindings w
set evidence = coalesce(w.evidence,'{}'::jsonb)
  || jsonb_build_object(
    'visual_source_audit_status','observed_consistent',
    'visual_source_audit_scope','30 LPC transition binding PNGs',
    'visual_source_archive','Asset-library-LPC_Finalized_Review.zip',
    'visual_source_path','02_TILES_AND_TERRAIN/',
    'semantic_runtime_status','not_verified'
  ),
notes='Visual audit of the source PNG is consistent with the recorded material/state transition classification. Binary identity is EXACT_MATCH 59/59. Exact engine tile-region/tileset mapping remains undefined; binding remains candidate.'
where exists (
  select 1 from public.asset_registry ar
  where ar.id=w.asset_id
    and ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
);

update public.asset_registry ar
set metadata = ar.metadata || case ar.name
  when 'lpc_terrain__tileset01a.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','ground_dirt_terrain_tileset')
  when 'lpc_terrain__tileset01b.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','grass_vegetation_terrain_tileset')
  when 'lpc_terrain__tileset01c.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','brick_masonry_tileset')
  when 'lpc_terrain__tileset01d.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','light_stone_masonry_tileset')
  when 'lpc_terrain__tileset01e.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','water_tileset')
  when 'lpc_terrain__tileset01f.png' then jsonb_build_object('visual_source_audit_status','observed','visual_role_observed','dark_stone_masonry_tileset')
  else '{}'::jsonb end
where ar.name in (
  'lpc_terrain__tileset01a.png','lpc_terrain__tileset01b.png',
  'lpc_terrain__tileset01c.png','lpc_terrain__tileset01d.png',
  'lpc_terrain__tileset01e.png','lpc_terrain__tileset01f.png'
);
