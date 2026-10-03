create or replace view public.world_asset_browser_inventory_v1 as
select
  a.id, a.external_key, a.name, a.slug, a.category, a.role, a.asset_path, a.preview_path,
  a.grid_width, a.grid_height, a.tile_width, a.tile_height, a.perspective,
  a.palette_family, a.outline_style, a.lighting_direction, a.season_capable,
  a.autotile_capable, a.collision_capable, a.interactable, a.status as asset_status,
  a.metadata as asset_metadata,
  s.id as source_id, s.name as source_name, s.slug as source_slug, s.source_url,
  s.repository_url, s.version as source_version, s.audit_status as source_audit_status,
  l.id as license_registry_id, l.licenses, l.attribution_required, l.attribution_text,
  l.commercial_use_allowed, l.modification_allowed, l.redistribution_allowed,
  l.verification_status as license_verification_status, l.usage_status as license_usage_status
from public.asset_registry a
join public.asset_sources s on s.id=a.source_id
left join public.asset_license_registry l on l.id=a.license_registry_id
where a.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/%';