-- WORLD Asset Library seed: only existing registry records with documented evidence.
-- No new asset identities are created here. Candidate bindings remain non-approved.
insert into public.asset_binary_verifications
(asset_id,verification_status,sha256,verification_method,repository_path,verified_at,notes)
values
('5786048f-8815-4b7e-8c11-9b0e1e973b1c','verified','07fc7b9678598db3ee9c9105954897415ef957df12a72def3478ec0ee85b8c0e','repository audit record','assets/map-editor/terrain/tile_grass.png',now(),'Previously verified original; checksum recorded in ASSET_LIBRARY_REGISTRY.md.'),
('2bbe2076-fea6-4124-a679-7e6114de191c','verified','59dabf609de751119922d06bcfd12cb758f3152ee97ccd628eed24b9299e788a','repository audit record','assets/map-editor/terrain/tile_dirt.png',now(),'Previously verified original; checksum recorded in ASSET_LIBRARY_REGISTRY.md.')
on conflict (asset_id) do nothing;

insert into public.world_biome_compatibility(asset_id,biome_key,compatibility,ecology_role,evidence,notes)
values
('5786048f-8815-4b7e-8c11-9b0e1e973b1c','grassland','preferred','primary_ground','{"basis":"existing approved terrain record","audit":"WORLD ground core"}','Canonical grass base; binary verification exists.'),
('5786048f-8815-4b7e-8c11-9b0e1e973b1c','forest','compatible','primary_ground','{"basis":"generic grass terrain","audit":"WORLD ground core"}','Reusable ground material; not forest-exclusive.'),
('2bbe2076-fea6-4124-a679-7e6114de191c','desert','compatible','secondary_ground','{"basis":"generic dirt terrain","audit":"WORLD ground core"}','Generic dirt may occur in desert composition; not desert-specific.'),
('2bbe2076-fea6-4124-a679-7e6114de191c','forest','compatible','secondary_ground','{"basis":"generic dirt terrain","audit":"WORLD ground core"}','Generic dirt material; not forest-exclusive.')
on conflict (asset_id,biome_key) do nothing;

insert into public.world_landform_bindings(asset_id,landform_key,binding_status,evidence,notes)
values
('56d2d3e5-732b-40a3-83be-a6f512987303','mountain','candidate','{"basis":"registry role mountain","source_mapping":"LPC Overworld"}','Candidate only; exact binary/source checksum reconciliation remains pending.'),
('de5da1b1-b53b-4483-a034-88fefcd108cf','mountain','candidate','{"basis":"registry role mountain_tileset","source_mapping":"LPC Mountains v6"}','Candidate only; exact binary/source checksum reconciliation remains pending.'),
('8bbe9c05-a158-448c-94a5-93b76ce4bfd8','mountain','candidate','{"basis":"registry role mountain_snow_variant","source_mapping":"LPC Mountains"}','Snow variant; candidate only pending binary verification.')
on conflict (asset_id,landform_key,variant_key) do nothing;

insert into public.world_biome_compatibility(asset_id,biome_key,compatibility,ecology_role,evidence,notes)
values
('8bbe9c05-a158-448c-94a5-93b76ce4bfd8','snow_tundra','candidate','snowy_landform','{"basis":"registry role mountain_snow_variant","audit":"WORLD snow/tundra"}','Candidate snowy landform binding; not a tundra-exclusive asset.')
on conflict (asset_id,biome_key) do nothing;
