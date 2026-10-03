-- 20260926100000 / asset_library_world_schema_v1
-- Canonical WORLD Asset Library extension.
-- Reuses public.asset_registry as the single canonical asset identity.
-- Does not duplicate binaries per biome, water state, vegetation family or landform.

create table if not exists public.asset_binary_verifications (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','mismatch','unavailable','rejected')),
  sha256 text,
  byte_size bigint,
  verification_method text,
  repository_path text,
  lfs_oid text,
  verified_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id)
);

create table if not exists public.world_biome_compatibility (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  biome_key text not null check (biome_key in (
    'forest','jungle','desert','swamp','snow_tundra','coastal',
    'grassland','mountain','hills','rocky','cave','volcanic'
  )),
  compatibility text not null default 'candidate'
    check (compatibility in ('candidate','compatible','preferred','blocked')),
  ecology_role text,
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id, biome_key)
);

create table if not exists public.world_water_bindings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  water_state text not null check (water_state in (
    'coastal_shallow','open','deep','brackish','cold','frozen'
  )),
  water_feature text check (water_feature in (
    'shoreline','river','lake','waterfall','ocean_sea','generic'
  )),
  flow_direction text check (flow_direction is null or flow_direction in (
    'none','north','south','east','west','northeast','northwest','southeast','southwest','radial'
  )),
  flow_strength text check (flow_strength is null or flow_strength in ('none','slow','medium','fast')),
  binding_status text not null default 'candidate'
    check (binding_status in ('candidate','verified','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id, water_state, water_feature)
);

create table if not exists public.world_landform_bindings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  landform_key text not null check (landform_key in (
    'mountain','hill','cliff','natural_rock','cave','cave_opening',
    'waterfall','pit','hole','volcanic','lava_rock'
  )),
  variant_key text,
  binding_status text not null default 'candidate'
    check (binding_status in ('candidate','verified','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id, landform_key, variant_key)
);

create table if not exists public.world_vegetation_bindings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  vegetation_family text not null check (vegetation_family in (
    'woodland_deciduous','conifer','seasonal','dead_tree',
    'jungle_giant_tree','jungle_viney_tree','jungle_giant_plant','jungle_giant_fungi',
    'understory_flower','understory_bush','understory_fern','understory_fungi',
    'orchard_fruit','desert_cactus','desert_succulent','desert_dry_shrub',
    'desert_tree','wetland_reed','wetland_water_plant','wetland_waterlogged',
    'magical','hazardous','special'
  )),
  ecology_role text,
  season text,
  binding_status text not null default 'candidate'
    check (binding_status in ('candidate','verified','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id, vegetation_family, season)
);

create table if not exists public.world_transition_bindings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_registry(id) on delete cascade,
  source_material text not null,
  target_material text not null,
  source_state text,
  target_state text,
  directionality text not null default 'bidirectional'
    check (directionality in ('bidirectional','source_to_target','target_to_source')),
  edge_type text not null default 'edge'
    check (edge_type in ('edge','corner','three_way','four_way','overlay','transition_sheet')),
  corner_support boolean not null default false,
  three_way_support boolean not null default false,
  four_way_support boolean not null default false,
  tileset_id text,
  tile_region text,
  binding_status text not null default 'candidate'
    check (binding_status in ('candidate','verified','blocked')),
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_asset_binary_verifications_status
  on public.asset_binary_verifications(verification_status);
create index if not exists idx_world_biome_compatibility_biome
  on public.world_biome_compatibility(biome_key, compatibility);
create index if not exists idx_world_water_bindings_state
  on public.world_water_bindings(water_state, water_feature);
create index if not exists idx_world_landform_bindings_key
  on public.world_landform_bindings(landform_key, binding_status);
create index if not exists idx_world_vegetation_bindings_family
  on public.world_vegetation_bindings(vegetation_family, binding_status);
create index if not exists idx_world_transition_bindings_materials
  on public.world_transition_bindings(source_material, target_material, binding_status);

alter table public.asset_binary_verifications enable row level security;
alter table public.world_biome_compatibility enable row level security;
alter table public.world_water_bindings enable row level security;
alter table public.world_landform_bindings enable row level security;
alter table public.world_vegetation_bindings enable row level security;
alter table public.world_transition_bindings enable row level security;

comment on table public.asset_binary_verifications is
  'Binary-level identity and repository verification for canonical asset_registry records. A source match alone never implies binary verification.';
comment on table public.world_biome_compatibility is
  'Many-to-many WORLD biome compatibility bindings; assets are not duplicated per biome.';
comment on table public.world_water_bindings is
  'WORLD water state + geographic feature bindings. Water state and feature are separate dimensions.';
comment on table public.world_landform_bindings is
  'WORLD orthogonal natural landform bindings.';
comment on table public.world_vegetation_bindings is
  'WORLD ecological vegetation-family bindings.';
comment on table public.world_transition_bindings is
  'WORLD material/state transition bindings. Transition records reference canonical assets rather than duplicating binaries.';
