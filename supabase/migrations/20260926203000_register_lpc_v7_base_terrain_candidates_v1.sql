-- Source-derived base tile candidates for the verified LPC v7 terrain tileset.
-- These remain pending. No runtime approval is granted here.

insert into public.asset_binding_candidates
(asset_id,terrain_type_id,transition_type,neighbor_mask,season,candidate_status,reviewer_note,evidence)
select
  '3d951ba9-f14d-40e7-bf14-17c191f77bb6'::uuid,
  t.id,
  'full',
  255,
  null,
  'pending',
  'Source-derived base tile candidate from lpc-terrains__terrain-v7.tsx; runtime approval remains blocked until asset registry approval and semantic/runtime review.',
  jsonb_build_object(
    'source_archive','Asset-library-LPC_Finalized_Review.zip',
    'source_tsx','02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.tsx',
    'source_tileset','lpc-terrains__terrain-v7.png',
    'tileset_id','lpc-revised-terrain-v7-derived',
    'tile_id',v.tile_id,
    'tile_region',jsonb_build_object('x',v.x,'y',v.y,'width',32,'height',32),
    'terrain_tuple',v.terrain_tuple,
    'mapping_status','source_verified_pending_runtime_review'
  )
from public.terrain_types t
join (values
  ('dirt',97,32,96,'3,3,3,3'),
  ('grass',321,32,320,'5,5,5,5'),
  ('sand',336,512,320,'22,22,22,22'),
  ('water',548,128,544,'28,28,28,28')
) as v(terrain_key,tile_id,x,y,terrain_tuple)
on t.terrain_key=v.terrain_key
where not exists (
  select 1 from public.asset_binding_candidates c
  where c.asset_id='3d951ba9-f14d-40e7-bf14-17c191f77bb6'::uuid
    and c.terrain_type_id=t.id
    and c.neighbor_mask=255
    and c.transition_type='full'
);
