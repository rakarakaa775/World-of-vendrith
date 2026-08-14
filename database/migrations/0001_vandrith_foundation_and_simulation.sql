-- VANDRITH WORLD v0.1
-- D.47 FOUNDATION + SIMULATION SQL MIGRATION
-- PostgreSQL / Supabase
-- STATUS: GENERATED, NOT APPLIED
-- This migration implements the locked Table Specification.
-- It intentionally does not store authentication credentials.

create extension if not exists pgcrypto;

-- ============================================================
-- FOUNDATION
-- ============================================================

create table if not exists users (
  id uuid default gen_random_uuid(),
  email text not null,
  constraint pk_users_id primary key (id),
  constraint uq_users_email unique (email),
  status text not null default 'active' check (status in ('active','disabled','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists profiles (
  id uuid default gen_random_uuid(),
  user_id uuid not null,
  display_name text not null,
  constraint pk_profiles_id primary key (id),
  constraint uq_profiles_user_id unique (user_id),
  constraint fk_profiles_user_id foreign key (user_id) references users(id) on delete cascade,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid default gen_random_uuid(),
  user_id uuid not null,
  ui_preferences jsonb not null default '{}'::jsonb,
  constraint pk_settings_id primary key (id),
  constraint uq_settings_user_id unique (user_id),
  constraint fk_settings_user_id foreign key (user_id) references users(id) on delete cascade,
  notification_preferences jsonb not null default '{}'::jsonb,
  gameplay_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  assigned_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  device_identifier text not null,
  device_type text not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_identifier)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  device_id uuid references devices(id) on delete set null,
  ip_address inet,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active','expired','revoked')),
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  message text not null,
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  action text not null,
  category text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- ============================================================
-- WORLD
-- ============================================================

create table if not exists worlds (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists continents (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references worlds(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(world_id, name)
);

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  continent_id uuid not null references continents(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(continent_id, name)
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id) on delete cascade,
  name text not null,
  location_type text not null,
  description text,
  parent_location_id uuid references locations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(region_id, name)
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null unique references locations(id) on delete cascade,
  name text not null,
  settlement_type text not null,
  population_limit integer,
  description text,
  status text not null default 'active' check (status in ('active','inactive','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (population_limit is null or population_limit >= 0)
);

-- ============================================================
-- SETTLEMENT / RESOURCES
-- ============================================================

create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements(id) on delete cascade,
  building_type text not null,
  name text not null,
  condition text not null default 'good',
  owner_id uuid,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  service_type text not null,
  active boolean not null default true,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements(id) on delete cascade,
  resource_type text not null,
  quantity numeric not null default 0 check (quantity >= 0),
  state text,
  regeneration_rate numeric,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- LIFE / SOCIAL
-- ============================================================

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid references settlements(id) on delete set null,
  residence_location_id uuid references locations(id) on delete set null,
  household_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists family_groups (
  id uuid primary key default gen_random_uuid(),
  name text,
  family_type text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sex text,
  birth_date timestamptz,
  death_date timestamptz,
  status text not null default 'alive' check (status in ('alive','dead','unknown')),
  location_id uuid references locations(id) on delete set null,
  household_id uuid references households(id) on delete set null,
  fate_grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'dead' and death_date is not null) or status <> 'dead')
);

create table if not exists family_memberships (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  family_id uuid not null references family_groups(id) on delete cascade,
  relation_type text not null,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'active'
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  life_a uuid not null references lives(id) on delete cascade,
  life_b uuid not null references lives(id) on delete cascade,
  relationship_type text not null,
  strength numeric not null default 0,
  status text not null default 'active',
  start_time timestamptz,
  end_time timestamptz,
  check (life_a <> life_b)
);

create table if not exists life_attributes (
  life_id uuid not null references lives(id) on delete cascade,
  attribute_type text not null,
  value numeric not null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (life_id, attribute_type)
);

create table if not exists life_needs (
  life_id uuid not null references lives(id) on delete cascade,
  need_type text not null,
  current_value numeric not null,
  target_value numeric not null,
  updated_at timestamptz not null default now(),
  primary key (life_id, need_type)
);

create table if not exists life_skills (
  life_id uuid not null references lives(id) on delete cascade,
  skill_type text not null,
  skill_id uuid,
  level numeric not null default 0,
  experience numeric not null default 0,
  primary key (life_id, skill_type)
);

create table if not exists birth_records (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null unique references lives(id) on delete cascade,
  parent_a_id uuid references lives(id) on delete set null,
  parent_b_id uuid references lives(id) on delete set null,
  birth_location_id uuid references locations(id) on delete set null,
  birth_time timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists death_records (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null unique references lives(id) on delete cascade,
  death_time timestamptz not null,
  cause text not null,
  location_id uuid references locations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid references settlements(id) on delete set null,
  name text not null,
  community_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_memberships (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  role text,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'active'
);

-- ============================================================
-- ORGANIZATION
-- ============================================================

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null,
  settlement_id uuid references settlements(id) on delete set null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  role_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_memberships (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role_id uuid references organization_roles(id) on delete set null,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'active'
);

create table if not exists occupations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  occupation_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employment (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  occupation_id uuid not null references occupations(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz,
  status text not null default 'active'
);

-- ============================================================
-- TIME / ENERGY
-- ============================================================

create table if not exists simulation_clock (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null unique references worlds(id) on delete cascade,
  current_tick bigint not null default 0 check (current_tick >= 0),
  current_date timestamptz not null,
  speed numeric not null default 1 check (speed >= 0),
  paused boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists calendar_definitions (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references worlds(id) on delete cascade,
  name text not null,
  rules jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists time_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references worlds(id) on delete cascade,
  event_type text not null,
  scheduled_time timestamptz not null,
  status text not null default 'scheduled',
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists day_records (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references worlds(id) on delete cascade,
  simulation_date timestamptz not null,
  summary jsonb,
  created_at timestamptz not null default now(),
  unique(world_id, simulation_date)
);

create table if not exists life_energy (
  life_id uuid primary key references lives(id) on delete cascade,
  current_energy numeric not null,
  max_energy numeric not null,
  fatigue numeric not null default 0,
  state text not null default 'normal',
  updated_at timestamptz not null default now(),
  check (max_energy >= 0),
  check (current_energy >= 0)
);

create table if not exists energy_history (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  timestamp timestamptz not null,
  old_state text,
  new_state text not null,
  cause text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ACTIVITY / TRAVEL
-- ============================================================

create table if not exists activity_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  activity_type text not null,
  default_duration numeric,
  energy_cost numeric,
  metadata jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  actor_life_id uuid not null references lives(id) on delete cascade,
  activity_definition_id uuid not null references activity_definitions(id) on delete restrict,
  location_id uuid references locations(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz,
  state text not null default 'scheduled',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  life_id uuid not null references lives(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists schedule_entries (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references schedules(id) on delete cascade,
  activity_definition_id uuid not null references activity_definitions(id) on delete restrict,
  start_minute integer not null,
  end_minute integer not null,
  priority integer not null default 0,
  check (start_minute >= 0 and end_minute > start_minute and end_minute <= 1440)
);

create table if not exists travel_records (
  id uuid primary key default gen_random_uuid(),
  actor_life_id uuid not null references lives(id) on delete cascade,
  origin_location_id uuid not null references locations(id) on delete restrict,
  destination_location_id uuid not null references locations(id) on delete restrict,
  departure_time timestamptz not null,
  arrival_time timestamptz,
  state text not null default 'planned',
  check (origin_location_id <> destination_location_id)
);

create table if not exists activity_interruptions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  cause text not null,
  interrupted_at timestamptz not null,
  resolved_at timestamptz,
  resolution text,
  status text not null default 'active'
);

-- ============================================================
-- HISTORY
-- ============================================================

create table if not exists history_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  scope_type text not null,
  scope_id uuid not null,
  timestamp timestamptz not null,
  summary text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists settlement_history (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements(id) on delete cascade,
  event_id uuid not null unique references history_events(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists history_causes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references history_events(id) on delete cascade,
  cause_type text not null,
  cause_reference text,
  metadata jsonb
);

create table if not exists history_consequences (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references history_events(id) on delete cascade,
  consequence_type text not null,
  consequence_reference text,
  metadata jsonb
);

create table if not exists history_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references history_events(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  role text
);

create table if not exists history_locations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references history_events(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  unique(event_id, location_id)
);

-- ============================================================
-- LEGACY / FUTURE HOOKS
-- ============================================================

create table if not exists legacies (
  id uuid primary key default gen_random_uuid(),
  identity text not null,
  origin text,
  creator_entity_type text,
  creator_entity_id uuid,
  purpose text,
  creation_time timestamptz,
  current_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists legacy_versions (
  id uuid primary key default gen_random_uuid(),
  legacy_id uuid not null references legacies(id) on delete cascade,
  version_number integer not null,
  state jsonb not null,
  created_at timestamptz not null default now(),
  reason text,
  unique(legacy_id, version_number)
);

create table if not exists legacy_modifications (
  id uuid primary key default gen_random_uuid(),
  legacy_id uuid not null references legacies(id) on delete cascade,
  old_version integer not null,
  new_version integer not null,
  modifier_entity_type text,
  modifier_entity_id uuid,
  reason text,
  history_event_id uuid references history_events(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists legacy_links (
  id uuid primary key default gen_random_uuid(),
  legacy_id uuid not null references legacies(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  relationship_type text,
  created_at timestamptz not null default now()
);

create table if not exists civilizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cultures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  metadata jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists religions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists civilization_influences (
  id uuid primary key default gen_random_uuid(),
  civilization_id uuid not null references civilizations(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  strength numeric not null default 0,
  start_time timestamptz,
  end_time timestamptz
);

create table if not exists polities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  polity_type text not null,
  status text not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists polity_memberships (
  id uuid primary key default gen_random_uuid(),
  polity_id uuid not null references polities(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  role text,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'active'
);

-- ============================================================
-- INVENTORY HOOK
-- ============================================================

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  item_type text not null,
  stackable boolean not null default true,
  metadata jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists item_instances (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete restrict,
  quantity numeric not null default 1 check (quantity > 0),
  condition numeric,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists containers (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  owner_id uuid not null,
  container_type text not null,
  capacity numeric,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory_entries (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references containers(id) on delete cascade,
  item_id uuid not null references items(id) on delete restrict,
  item_instance_id uuid references item_instances(id) on delete set null,
  quantity numeric not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_continents_world_id on continents(world_id);
create index if not exists idx_regions_continent_id on regions(continent_id);
create index if not exists idx_locations_region_id on locations(region_id);
create index if not exists idx_locations_parent_id on locations(parent_location_id);
create index if not exists idx_buildings_settlement_id on buildings(settlement_id);
create index if not exists idx_services_building_id on services(building_id);
create index if not exists idx_resources_settlement_type on resources(settlement_id, resource_type);
create index if not exists idx_households_settlement_id on households(settlement_id);
create index if not exists idx_lives_location_id on lives(location_id);
create index if not exists idx_lives_household_id on lives(household_id);
create index if not exists idx_lives_status on lives(status);
create index if not exists idx_family_memberships_life on family_memberships(life_id);
create index if not exists idx_family_memberships_family on family_memberships(family_id);
create index if not exists idx_relationships_life_a on relationships(life_a);
create index if not exists idx_relationships_life_b on relationships(life_b);
create index if not exists idx_community_memberships_life on community_memberships(life_id);
create index if not exists idx_community_memberships_community on community_memberships(community_id);
create index if not exists idx_org_memberships_life on organization_memberships(life_id);
create index if not exists idx_org_memberships_org on organization_memberships(organization_id);
create index if not exists idx_employment_life on employment(life_id);
create index if not exists idx_employment_org on employment(organization_id);
create index if not exists idx_time_events_world_time on time_events(world_id, scheduled_time);
create index if not exists idx_energy_history_life_time on energy_history(life_id, timestamp);
create index if not exists idx_activities_actor_state on activities(actor_life_id, state);
create index if not exists idx_activities_start_time on activities(start_time);
create index if not exists idx_schedule_entries_schedule on schedule_entries(schedule_id);
create index if not exists idx_travel_actor_state on travel_records(actor_life_id, state);
create index if not exists idx_history_events_scope_time on history_events(scope_type, scope_id, timestamp);
create index if not exists idx_history_causes_event on history_causes(event_id);
create index if not exists idx_history_consequences_event on history_consequences(event_id);
create index if not exists idx_history_participants_event on history_participants(event_id);
create index if not exists idx_history_locations_event on history_locations(event_id);
create index if not exists idx_legacy_versions_legacy on legacy_versions(legacy_id);
create index if not exists idx_legacy_modifications_legacy on legacy_modifications(legacy_id);
create index if not exists idx_legacy_links_legacy on legacy_links(legacy_id);
create index if not exists idx_inventory_entries_container on inventory_entries(container_id);

-- ============================================================
-- AUDIT IMMUTABILITY
-- ============================================================

create or replace function prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

drop trigger if exists trg_audit_logs_immutable on audit_logs;
create trigger trg_audit_logs_immutable
before update or delete on audit_logs
for each row execute function prevent_audit_log_mutation();

-- ============================================================
-- UPDATED_AT HELPER
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to mutable tables with updated_at.
do $$
declare
  t text;
begin
  foreach t in array array[
    'users','profiles','settings','roles','permissions','devices','sessions',
    'worlds','continents','regions','locations','settlements','buildings','services','resources',
    'households','family_groups','lives','life_attributes','communities','organizations',
    'organization_roles','occupations','simulation_clock','calendar_definitions','time_events',
    'activity_definitions','activities','schedules','legacies','civilizations','cultures',
    'languages','religions','polities','items','item_instances','containers'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated_at on %I', t, t);
    execute format('create trigger trg_%I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- RLS
-- ============================================================

alter table profiles enable row level security;
alter table settings enable row level security;
alter table devices enable row level security;
alter table sessions enable row level security;
alter table notifications enable row level security;

-- Simulation tables are initially service/engine controlled.
-- Policies are intentionally conservative until the application auth contract
-- is mapped to the final client roles.

create policy profiles_select_own on profiles
for select using (user_id = auth.uid());

create policy profiles_update_own on profiles
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy settings_select_own on settings
for select using (user_id = auth.uid());

create policy settings_update_own on settings
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy devices_select_own on devices
for select using (user_id = auth.uid());

create policy notifications_select_own on notifications
for select using (user_id = auth.uid());

create policy notifications_update_own on notifications
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Sessions are not exposed for client mutation.
-- Auth credentials/tokens remain outside these tables.

-- ============================================================
-- FOUNDATION FK INDEXES
-- ============================================================

create index if not exists idx_profiles_user_id
  on profiles(user_id);

create index if not exists idx_settings_user_id
  on settings(user_id);

create index if not exists idx_role_permissions_role_id
  on role_permissions(role_id);

create index if not exists idx_role_permissions_permission_id
  on role_permissions(permission_id);

create index if not exists idx_user_roles_user_id
  on user_roles(user_id);

create index if not exists idx_user_roles_role_id
  on user_roles(role_id);

create index if not exists idx_devices_user_id
  on devices(user_id);

create index if not exists idx_sessions_user_id
  on sessions(user_id);

create index if not exists idx_notifications_user_id
  on notifications(user_id);

create index if not exists idx_audit_logs_user_id
  on audit_logs(user_id);

-- ============================================================
-- END
-- ============================================================
