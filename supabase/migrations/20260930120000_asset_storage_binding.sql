alter table public.asset_files
  add column if not exists storage_bucket text,
  add column if not exists storage_path text;

comment on column public.asset_files.storage_bucket is
  'Canonical Supabase Storage bucket for the verified binary object.';

comment on column public.asset_files.storage_path is
  'Canonical content-addressed object path inside storage_bucket.';

create unique index if not exists asset_files_storage_binding_unique
  on public.asset_files (storage_bucket, storage_path)
  where storage_bucket is not null and storage_path is not null;

alter table public.asset_files
  add constraint asset_files_storage_binding_pair_check
  check (
    (storage_bucket is null and storage_path is null)
    or
    (storage_bucket is not null and storage_path is not null)
  );