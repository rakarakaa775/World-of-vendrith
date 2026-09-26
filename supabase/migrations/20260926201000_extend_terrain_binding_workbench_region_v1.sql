-- Additive runtime binding metadata surface.
-- Existing workbench columns are preserved; tile_region and tileset_id are appended.
-- No binding candidates or approval states are changed.

create or replace view public.vandrith_asset_binding_workbench as
select
  c.id as candidate_id,
  c.asset_id,
  c.terrain_type_id,
  t.terrain_key,
  c.transition_type,
  c.neighbor_mask,
  c.season,
  c.candidate_status,
  c.reviewer_note,
  a.status as asset_status,
  a.asset_path,
  a.category,
  a.role,
  a.autotile_capable,
  a.season_capable,
  a.license_registry_id,
  c.evidence -> 'tile_region' as tile_region,
  c.evidence ->> 'tileset_id' as tileset_id
from public.asset_binding_candidates c
left join public.terrain_types t on t.id = c.terrain_type_id
join public.asset_registry a on a.id = c.asset_id;
