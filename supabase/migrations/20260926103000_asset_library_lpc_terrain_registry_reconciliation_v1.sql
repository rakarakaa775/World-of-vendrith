-- Asset Library WORLD: LPC Terrains registry reconciliation
-- 2026-09-26
-- Source: https://opengameart.org/content/lpc-terrains
-- Binary identity remains pending; this migration records source-family classification only.

do $$
declare
  v_source uuid;
  v_license uuid;
begin
  select id into v_source from public.asset_sources where slug='lpc-terrains';
  if v_source is null then
    insert into public.asset_sources
      (name,slug,author,source_url,description,audit_status,metadata)
    values
      ('[LPC] Terrains','lpc-terrains',
       'bluecarrot16; contributors listed in CREDITS-terrain.txt',
       'https://opengameart.org/content/lpc-terrains',
       'LPC terrain package used by the WORLD terrain/water audit.',
       'provisional',
       jsonb_build_object('source_family','LPC Terrains'))
    returning id into v_source;
  end if;

  select id into v_license
  from public.asset_license_registry
  where source_repository='https://opengameart.org/content/lpc-terrains'
    and asset_external_key='source-pack:lpc-terrains';

  if v_license is null then
    insert into public.asset_license_registry
      (source_repository,source_path,source_pack,asset_external_key,authors,
       licenses,source_urls,verification_status,usage_status,attribution_required,
       attribution_text,commercial_use_allowed,modification_allowed,
       redistribution_allowed,audit_notes,metadata)
    values
      ('https://opengameart.org/content/lpc-terrains','CREDITS-terrain.txt',
       '[LPC] Terrains','source-pack:lpc-terrains',
       ARRAY[
         'bluecarrot16','Lanea Zimmerman (Sharm)','Daniel Eddeland (Daneeklu)',
         'Richard Kettering (Jetrel)','Zachariah Husiar (Zabin)','Hyptosis',
         'Casper Nilsson','Buko Studios','Nushio','ZaPaper','billknye',
         'William Thompson','caeles','Redshrike','Bertram','Rayane Félix (RayaneFLX)'
       ],
       ARRAY['CC-BY-SA 4.0','CC-BY-SA 3.0'],
       ARRAY['https://opengameart.org/content/lpc-terrains'],
       'verified','conditional',true,
       'Retain complete CREDITS-terrain.txt attribution and the OpenGameArt link.',
       true,true,true,
       'License/source verified from OGA; individual repository binaries still require binary identity/checksum reconciliation.',
       jsonb_build_object('binary_verification_required',true))
    returning id into v_license;
  end if;

  insert into public.asset_registry
    (source_id,license_registry_id,external_key,name,slug,category,role,
     asset_path,status,metadata)
  select
    v_source,v_license,'repo:'||f,f,
    'lpc-terrain-'||regexp_replace(lower(replace(f,'.png','')),'[^a-z0-9]+','-','g'),
    category,role,
    'ASSET_LIBRARY/02_TILES_AND_TERRAIN/'||f,
    'pending',
    jsonb_build_object(
      'source_family','LPC Terrains',
      'repository_path','assets/world/world/02_TILES_AND_TERRAIN/'||f,
      'classification_status','audit_classified',
      'binary_verification_status','pending'
    )
  from (values
    ('lpc_terrain__water.png','water','water'),
    ('lpc_terrain__deepwater.png','water','water'),
    ('lpc_terrain__deepwater2.png','water','water'),
    ('lpc_terrain__brackish.png','water','water'),
    ('lpc_terrain__coldwater.png','water','water'),
    ('lpc_terrain__coldwatergrass.png','water','water_transition'),
    ('lpc_terrain__coldwatergrassaltother.png','water','water_transition'),
    ('lpc_terrain__coldwaterredsandother.png','water','water_transition'),
    ('lpc_terrain__coldwatersandother.png','water','water_transition'),
    ('lpc_terrain__coldwatersnowgrass.png','water','water_transition'),
    ('lpc_terrain__coldwatersnowother.png','water','water_transition'),
    ('lpc_terrain__redsandwater.png','water','water_transition'),
    ('lpc_terrain__sandredsandwater.png','water','water_transition'),
    ('lpc_terrain__sandwater.png','water','water_transition'),
    ('lpc_terrain__watergrass.png','water','water_transition'),
    ('lpc_terrain__watergrassaltother.png','water','water_transition'),
    ('lpc_terrain__waterredsandother.png','water','water_transition'),
    ('lpc_terrain__watersandother.png','water','water_transition'),
    ('lpc_terrain__watersnowgrass.png','water','water_transition'),
    ('lpc_terrain__watersnowother.png','water','water_transition'),
    ('lpc_terrain__snowcoldwater.png','water','water_transition'),
    ('lpc_terrain__snowwater.png','water','water_transition'),
    ('lpc_terrain__ice.png','frozen','ice'),
    ('lpc_terrain__icegrass.png','frozen','ice_transition'),
    ('lpc_terrain__icegrassaltother.png','frozen','ice_transition'),
    ('lpc_terrain__iceredsandother.png','frozen','ice_transition'),
    ('lpc_terrain__icesandother.png','frozen','ice_transition'),
    ('lpc_terrain__icesnowgrass.png','frozen','ice_transition'),
    ('lpc_terrain__icesnowother.png','frozen','ice_transition'),
    ('lpc_terrain__snowice.png','frozen','ice_transition'),
    ('lpc_terrain__dirt.png','ground','dirt'),
    ('lpc_terrain__dirt2.png','ground','dirt'),
    ('lpc_terrain__dirt_night.png','ground','dirt_night'),
    ('lpc_terrain__grass.png','ground','grass'),
    ('lpc_terrain__grass_night.png','ground','grass_night'),
    ('lpc_terrain__grassalt.png','ground','grass_variant'),
    ('lpc_terrain__grassgrassaltother.png','ground','grass_transition'),
    ('lpc_terrain__redsand.png','ground','red_sand'),
    ('lpc_terrain__sand.png','ground','sand'),
    ('lpc_terrain__sandredsand.png','ground','sand_transition'),
    ('lpc_terrain__snow.png','ground','snow'),
    ('lpc_terrain__tallgrass.png','vegetation','tall_grass'),
    ('lpc_terrain__hole.png','terrain_formation','hole'),
    ('lpc_terrain__holegrassaltother.png','terrain_formation','hole_transition'),
    ('lpc_terrain__holek.png','terrain_formation','hole_variant'),
    ('lpc_terrain__holekgrassaltother.png','terrain_formation','hole_transition'),
    ('lpc_terrain__holelikegrassaltotheroverlay.png','terrain_formation','hole_overlay'),
    ('lpc_terrain__holelikegrassoverlay.png','terrain_formation','hole_overlay'),
    ('lpc_terrain__holemid.png','terrain_formation','hole'),
    ('lpc_terrain__holemidgrassaltother.png','terrain_formation','hole_transition'),
    ('lpc_terrain__lava.png','volcanic','lava'),
    ('lpc_terrain__lavagrassaltother.png','volcanic','lava_transition'),
    ('lpc_terrain__lavarock.png','volcanic','lava_rock'),
    ('lpc_terrain__tileset01a.png','ground_terrain','source_tileset'),
    ('lpc_terrain__tileset01b.png','ground_terrain','source_tileset'),
    ('lpc_terrain__tileset01c.png','ground_terrain','source_tileset'),
    ('lpc_terrain__tileset01d.png','ground_terrain','source_tileset'),
    ('lpc_terrain__tileset01e.png','ground_terrain','source_tileset'),
    ('lpc_terrain__tileset01f.png','ground_terrain','source_tileset')
  ) as x(f,category,role)
  on conflict(source_id,external_key) do update
    set license_registry_id=excluded.license_registry_id,
        asset_path=excluded.asset_path,
        metadata=public.asset_registry.metadata || excluded.metadata;
end $$;

-- Water-state bindings: candidate until binary/source reconciliation is complete.
insert into public.world_water_bindings
  (asset_id,water_state,water_feature,binding_status,evidence,notes)
select ar.id,x.water_state,x.water_feature,'candidate',
       '{"source":"LPC_TERRAINS_WORLD_AUDIT_2026-09-26.md"}'::jsonb,
       'Filename classification only; binary verification pending.'
from public.asset_registry ar
join (values
  ('lpc_terrain__water.png','open','generic'),
  ('lpc_terrain__deepwater.png','deep','generic'),
  ('lpc_terrain__deepwater2.png','deep','generic'),
  ('lpc_terrain__brackish.png','brackish','generic'),
  ('lpc_terrain__coldwater.png','cold','generic'),
  ('lpc_terrain__coldwatergrass.png','cold','generic'),
  ('lpc_terrain__coldwatergrassaltother.png','cold','generic'),
  ('lpc_terrain__coldwaterredsandother.png','cold','generic'),
  ('lpc_terrain__coldwatersandother.png','cold','generic'),
  ('lpc_terrain__coldwatersnowgrass.png','cold','generic'),
  ('lpc_terrain__coldwatersnowother.png','cold','generic'),
  ('lpc_terrain__redsandwater.png','coastal_shallow','shoreline'),
  ('lpc_terrain__sandredsandwater.png','coastal_shallow','shoreline'),
  ('lpc_terrain__sandwater.png','coastal_shallow','shoreline'),
  ('lpc_terrain__watergrass.png','coastal_shallow','shoreline'),
  ('lpc_terrain__watergrassaltother.png','coastal_shallow','shoreline'),
  ('lpc_terrain__waterredsandother.png','coastal_shallow','shoreline'),
  ('lpc_terrain__watersandother.png','coastal_shallow','shoreline'),
  ('lpc_terrain__watersnowgrass.png','cold','generic'),
  ('lpc_terrain__watersnowother.png','cold','generic'),
  ('lpc_terrain__snowcoldwater.png','cold','generic'),
  ('lpc_terrain__snowwater.png','cold','generic')
) x(file_name,water_state,water_feature)
on ar.asset_path='ASSET_LIBRARY/02_TILES_AND_TERRAIN/'||x.file_name
on conflict(asset_id,water_state,water_feature) do update
  set binding_status='candidate',evidence=excluded.evidence,notes=excluded.notes;

-- Transition bindings: candidate until exact tile regions and binaries are verified.
insert into public.world_transition_bindings
  (asset_id,source_material,target_material,source_state,target_state,
   directionality,edge_type,binding_status,evidence,notes)
select ar.id,x.source_material,x.target_material,x.source_state,x.target_state,
       'bidirectional','transition_sheet','candidate',
       '{"source":"LPC_TERRAINS_WORLD_AUDIT_2026-09-26.md"}'::jsonb,
       'Filename classification only; tile-region and binary verification pending.'
from public.asset_registry ar
join (values
  ('lpc_terrain__coldwatergrass.png','cold_water','grass','cold','grass'),
  ('lpc_terrain__coldwatergrassaltother.png','cold_water','grass_variant','cold','grass'),
  ('lpc_terrain__coldwaterredsandother.png','cold_water','red_sand','cold','red_sand'),
  ('lpc_terrain__coldwatersandother.png','cold_water','sand','cold','sand'),
  ('lpc_terrain__coldwatersnowgrass.png','cold_water','snow_grass','cold','snow'),
  ('lpc_terrain__coldwatersnowother.png','cold_water','snow','cold','snow'),
  ('lpc_terrain__redsandwater.png','red_sand','water','ground','coastal_shallow'),
  ('lpc_terrain__sandredsandwater.png','sand_red_sand','water','ground','coastal_shallow'),
  ('lpc_terrain__sandwater.png','sand','water','ground','coastal_shallow'),
  ('lpc_terrain__watergrass.png','water','grass','coastal_shallow','grass'),
  ('lpc_terrain__watergrassaltother.png','water','grass_variant','coastal_shallow','grass'),
  ('lpc_terrain__waterredsandother.png','water','red_sand','coastal_shallow','red_sand'),
  ('lpc_terrain__watersandother.png','water','sand','coastal_shallow','sand'),
  ('lpc_terrain__watersnowgrass.png','water','snow_grass','cold','snow'),
  ('lpc_terrain__watersnowother.png','water','snow','cold','snow'),
  ('lpc_terrain__snowcoldwater.png','snow','cold_water','snow','cold'),
  ('lpc_terrain__snowwater.png','snow','water','snow','cold'),
  ('lpc_terrain__icegrass.png','ice','grass','frozen','grass'),
  ('lpc_terrain__icegrassaltother.png','ice','grass_variant','frozen','grass'),
  ('lpc_terrain__iceredsandother.png','ice','red_sand','frozen','red_sand'),
  ('lpc_terrain__icesandother.png','ice','sand','frozen','sand'),
  ('lpc_terrain__icesnowgrass.png','ice','snow_grass','frozen','snow'),
  ('lpc_terrain__icesnowother.png','ice','snow','frozen','snow'),
  ('lpc_terrain__snowice.png','snow','ice','snow','frozen'),
  ('lpc_terrain__grassgrassaltother.png','grass','grass_variant','ground','grass_variant'),
  ('lpc_terrain__sandredsand.png','sand','red_sand','ground','red_sand'),
  ('lpc_terrain__holegrassaltother.png','hole','grass_variant','formation','grass'),
  ('lpc_terrain__holekgrassaltother.png','hole_variant','grass_variant','formation','grass'),
  ('lpc_terrain__holemidgrassaltother.png','hole','grass_variant','formation','grass'),
  ('lpc_terrain__lavagrassaltother.png','lava','grass','volcanic','grass')
) x(file_name,source_material,target_material,source_state,target_state)
on ar.asset_path='ASSET_LIBRARY/02_TILES_AND_TERRAIN/'||x.file_name
where not exists (
  select 1 from public.world_transition_bindings w
  where w.asset_id=ar.id
    and w.source_material=x.source_material
    and w.target_material=x.target_material
    and w.source_state=x.source_state
    and w.target_state=x.target_state
    and w.directionality='bidirectional'
    and w.edge_type='transition_sheet'
);
