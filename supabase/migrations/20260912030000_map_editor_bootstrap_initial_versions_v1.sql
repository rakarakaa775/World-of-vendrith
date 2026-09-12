-- Map Editor: ensure every owned map has an initial immutable version.
-- This makes Save/Load slots usable immediately after bootstrap and is idempotent.
insert into public.map_versions (map_id, version_number, label, snapshot, created_by)
select
  m.id,
  1,
  'initial-bootstrap',
  jsonb_build_object(
    'schema', 'vandrith.map-document',
    'version', 1,
    'document', jsonb_build_object(
      'version', 1,
      'id', m.id::text,
      'name', m.name,
      'mapType', m.map_type,
      'parentMapId', m.parent_map_id,
      'width', 20,
      'height', 12,
      'tileSize', 32,
      'layers', jsonb_build_array(
        jsonb_build_object(
          'id', 'ground', 'name', 'Ground', 'kind', 'ground',
          'visible', true, 'locked', false, 'active', true,
          'cells', (select coalesce(jsonb_agg(jsonb_build_object('tileId', null) order by g.i), '[]'::jsonb) from generate_series(1,240) as g(i)),
          'objects', '[]'::jsonb
        ),
        jsonb_build_object(
          'id', 'objects', 'name', 'Objects', 'kind', 'objects',
          'visible', true, 'locked', false, 'active', false,
          'cells', (select coalesce(jsonb_agg(jsonb_build_object('tileId', null) order by o.i), '[]'::jsonb) from generate_series(1,240) as o(i)),
          'objects', '[]'::jsonb
        ),
        jsonb_build_object(
          'id', 'collision', 'name', 'Collision', 'kind', 'collision',
          'visible', true, 'locked', false, 'active', false,
          'cells', (select coalesce(jsonb_agg(jsonb_build_object('tileId', null) order by c.i), '[]'::jsonb) from generate_series(1,240) as c(i)),
          'objects', '[]'::jsonb
        )
      ),
      'playableSpace', case when m.map_type = 'playable' then 'exterior' else null end,
      'parentPlayableMapId', null
    )
  ),
  m.created_by
from public.maps m
where m.created_by is not null
  and not exists (
    select 1 from public.map_versions mv where mv.map_id = m.id
  );
