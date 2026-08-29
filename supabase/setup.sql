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

-- Any signed-in user may add / replace / remove objects. The admin panel is
-- gated in the app (ADMIN_EMAILS -> users.role), so this is the practical
-- boundary for v1; tighten to an admin JWT claim later if needed.
drop policy if exists "media authenticated write" on storage.objects;
create policy "media authenticated write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media authenticated update" on storage.objects;
create policy "media authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media authenticated delete" on storage.objects;
create policy "media authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
