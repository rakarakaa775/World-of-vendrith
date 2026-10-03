insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'vandrith-assets',
  'vandrith-assets',
  true,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update
set public = excluded.public,
    allowed_mime_types = excluded.allowed_mime_types;
