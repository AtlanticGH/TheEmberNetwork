-- Supabase Storage setup for Ember Network (run after platform.sql)
-- Creates a bucket and RLS policies for uploads + public reads.

-- Bucket: public (if you prefer a dedicated bucket, change name here and in app code)
insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do update
set public = excluded.public;

-- Policies (storage.objects)
-- Public read
drop policy if exists "public_read_public_bucket" on storage.objects;
create policy "public_read_public_bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public');

-- Staff uploads
drop policy if exists "staff_insert_public_bucket" on storage.objects;
create policy "staff_insert_public_bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'public'
  and public.is_staff()
);

-- Staff updates
drop policy if exists "staff_update_public_bucket" on storage.objects;
create policy "staff_update_public_bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'public'
  and public.is_staff()
)
with check (
  bucket_id = 'public'
  and public.is_staff()
);

-- Staff deletes
drop policy if exists "staff_delete_public_bucket" on storage.objects;
create policy "staff_delete_public_bucket"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'public'
  and public.is_staff()
);

