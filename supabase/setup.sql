-- Run once in the Supabase SQL editor (or psql) after `pnpm db:migrate`.
-- Creates the public media bucket used by the admin image uploads and its
-- access policies. Application data tables are managed by Drizzle migrations
-- and are reached only through the trusted server connection, so RLS is left
-- off on them.

-- 1. Storage bucket for event / recap / spotlight images -----------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 2. Storage policies ---------------------------------------------------------
-- Public read of every object in the bucket.
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Writes go through the tRPC `admin.media.createUploadUrl` procedure, which is
-- behind `adminProcedure` and mints a one-shot signed upload URL with the
-- service-role key. Signed uploads and the service-role client both bypass RLS,
-- so there are NO INSERT / UPDATE / DELETE policies here — the browser has no
-- write path to storage.objects.
drop policy if exists "media authenticated write" on storage.objects;
drop policy if exists "media authenticated update" on storage.objects;
drop policy if exists "media authenticated delete" on storage.objects;
