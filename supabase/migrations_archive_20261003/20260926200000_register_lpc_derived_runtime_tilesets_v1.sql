-- Additive registration of verified LPC derived runtime tilesets.
-- This does not approve the source binaries or create runtime binding candidates.
-- It only gives the runtime mapping work a canonical registry identity.

insert into public.asset_registry (
  source_id, license_registry_id, external_key, name, slug, category, role,
  asset_path, grid_width, grid_height, tile_width, tile_height, perspective,
  status, metadata
)
select
  'd73d56e3-211f-44f8-917d-ee0cb559abb4'::uuid,
  '2eee4fb8-85a5-4fd7-a3fc-e1bb7f0bc80d'::uuid,
  'lpc-revised-terrain-v7-derived',
  'LPC Revised Terrain v7 Derived Tileset',
  'lpc_revised_terrain_v7_derived',
  'exterior.terrain',
  'terrain_tileset',
  'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.png',
  32,
  64,
  32,
  32,
  'top_down',
  'pending',
  jsonb_build_object(
    'width', 1024,
    'height', 2048,
    'tile_columns', 32,
    'tile_rows', 64,
    'tile_count_declared', 2048,
    'source_path', '02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.png',
    'tsx_source_path', '02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.tsx',
    'sha256', 'd098d23fbe6bb51b53f5d719d05a8e620d393f9d831bb14d2ed201b650163b7b',
    'source_archive', 'Asset-library-LPC_Finalized_Review.zip',
    'source_binary_verified', true,
    'runtime_region_capable', true,
    'approval_boundary', 'pending'
  )
where not exists (
  select 1 from public.asset_registry
  where asset_path = 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.png'
);

insert into public.asset_registry (
  source_id, license_registry_id, external_key, name, slug, category, role,
  asset_path, grid_width, grid_height, tile_width, tile_height, perspective,
  status, metadata
)
select
  'd73d56e3-211f-44f8-917d-ee0cb559abb4'::uuid,
  '2eee4fb8-85a5-4fd7-a3fc-e1bb7f0bc80d'::uuid,
  'lpc-revised-terrain-map-v7-derived',
  'LPC Revised Terrain Map v7 Derived Transition Tileset',
  'lpc_revised_terrain_map_v7_derived',
  'exterior.terrain',
  'terrain_transition_tileset',
  'ASSET_LIBRARY/02_TILES_AND_TERRAIN/tiled__terrain-map-v7.png',
  16,
  984,
  32,
  32,
  'top_down',
  'pending',
  jsonb_build_object(
    'width', 512,
    'height', 31488,
    'tile_columns', 16,
    'tile_rows', 984,
    'tile_count_declared', 15562,
    'source_path', '02_TILES_AND_TERRAIN/tiled__terrain-map-v7.png',
    'tsx_source_path', '02_TILES_AND_TERRAIN/tiled__terrain-map-v7.tsx',
    'sha256', 'adc395adc3defb182389d4ca888afdd896bdd6b672ab92609b428a5bbd79cd25',
    'source_archive', 'Asset-library-LPC_Finalized_Review.zip',
    'source_binary_verified', true,
    'runtime_region_capable', true,
    'approval_boundary', 'pending'
  )
where not exists (
  select 1 from public.asset_registry
  where asset_path = 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/tiled__terrain-map-v7.png'
);

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.asset_registry
  where asset_path in (
    'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc-terrains__terrain-v7.png',
    'ASSET_LIBRARY/02_TILES_AND_TERRAIN/tiled__terrain-map-v7.png'
  );

  if v_count <> 2 then
    raise exception 'Expected 2 derived LPC tileset registry rows, found %', v_count;
  end if;
end $$;
