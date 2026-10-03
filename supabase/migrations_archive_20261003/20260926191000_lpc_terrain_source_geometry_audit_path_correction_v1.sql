-- Correction for ASSET_LIBRARY path prefix used by LPC source geometry audit.
-- Records only geometry directly supported by source PNG dimensions.
update public.asset_registry ar
set tile_width=16,
    tile_height=16,
    grid_width=case
      when ar.asset_path in (
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__coldwatergrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__coldwaterredsandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowgrass.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__coldwatersnowother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__grassgrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__holegrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__holekgrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__holelikegrassaltotheroverlay.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__holemidgrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icegrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__iceredsandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icesandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icesnowgrass.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icesnowother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__lavagrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__sandredsandwater.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__watergrassaltother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__waterredsandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__watersandother.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__watersnowgrass.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__watersnowother.png'
      ) then 12 else 10 end,
    grid_height=case
      when ar.asset_path in (
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__tileset01a.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__tileset01b.png',
        'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__tileset01c.png'
      ) then 14 else 12 end,
    metadata=ar.metadata||jsonb_build_object(
      'source_grid_verified',true,
      'source_tile_width',16,
      'source_tile_height',16,
      'source_geometry_basis','PNG pixel dimensions in Asset-library-LPC_Finalized_Review.zip'
    )
where ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png';

select count(*) as verified_geometry_assets
from public.asset_registry
where asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__%.png'
  and tile_width=16 and tile_height=16
  and metadata->>'source_grid_verified'='true';