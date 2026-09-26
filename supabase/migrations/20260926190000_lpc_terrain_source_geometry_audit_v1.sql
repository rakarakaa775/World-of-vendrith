-- LPC terrain source PNG geometry audit
-- 2026-09-26
-- Source evidence: Asset-library-LPC_Finalized_Review.zip / 02_TILES_AND_TERRAIN/
-- All audited LPC terrain PNGs use 16x16 source tile cells.
-- 160x192 => 10x12 cells; 192x192 => 12x12 cells; 160x224 => 10x14 cells.
-- This migration records observed source geometry only.
-- It intentionally does NOT assign runtime tileset_id/tile_region or promote binding_status.

update public.asset_registry ar
set tile_width=16,
    tile_height=16,
    grid_width=case
      when ar.asset_path in (
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatergrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwaterredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__grassgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holegrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holekgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holelikegrassaltotheroverlay.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holemidgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icegrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__iceredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesnowother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__lavagrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__sandredsandwater.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watergrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__waterredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersnowother.png'
      ) then 12
      when ar.asset_path in (
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01a.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01b.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01c.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__chainlinkpagerusty.png'
      ) then 10
      else 10 end,
    grid_height=case
      when ar.asset_path in (
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01a.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01b.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__tileset01c.png'
      ) then 14
      when ar.asset_path like '%lpc_terrain__chainlinkpagerusty.png' then 14
      when ar.asset_path in (
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatergrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwaterredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__grassgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holegrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holekgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holelikegrassaltotheroverlay.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__holemidgrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icegrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__iceredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__icesnowother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__lavagrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__sandredsandwater.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watergrassaltother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__waterredsandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersandother.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersnowgrass.png',
        'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__watersnowother.png'
      ) then 12
      else 12 end,
    metadata = ar.metadata || jsonb_build_object(
      'source_grid_verified', true,
      'source_tile_width', 16,
      'source_tile_height', 16,
      'source_geometry_basis', 'PNG pixel dimensions in Asset-library-LPC_Finalized_Review.zip'
    )
where ar.asset_path like 'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__%.png';

select count(*) as verified_geometry_assets
from public.asset_registry
where asset_path like 'assets/world/world/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  and tile_width=16 and tile_height=16
  and metadata->>'source_grid_verified'='true';
