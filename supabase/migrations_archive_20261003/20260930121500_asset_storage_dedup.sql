drop index if exists public.asset_files_storage_binding_unique;

create index if not exists asset_files_storage_binding_idx
  on public.asset_files (storage_bucket, storage_path)
  where storage_bucket is not null and storage_path is not null;