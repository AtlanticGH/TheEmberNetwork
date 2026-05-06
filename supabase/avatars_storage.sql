-- Private avatars bucket + RLS policies
-- Run AFTER `supabase/teams.sql` (requires public.is_staff) or after platform.sql if you prefer.

-- Bucket: avatars (private)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update
set public = excluded.public;

-- Users can read their own avatar objects (needed for signed URLs)
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (name like auth.uid()::text || '/%')
);

-- Users can upload into their own folder only
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (name like auth.uid()::text || '/%')
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (name like auth.uid()::text || '/%')
)
with check (
  bucket_id = 'avatars'
  and (name like auth.uid()::text || '/%')
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (name like auth.uid()::text || '/%')
);

