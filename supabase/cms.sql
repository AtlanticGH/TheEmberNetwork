-- Ember Network CMS tables (run after schema.sql + platform.sql)

-- SITE CONTENT (simple JSON per key)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_read_public" on public.site_content;
create policy "site_content_read_public"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "site_content_manage_staff" on public.site_content;
create policy "site_content_manage_staff"
on public.site_content
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Keep updated_at fresh
create or replace function public.touch_site_content()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_touch_updated_at on public.site_content;
create trigger site_content_touch_updated_at
before update on public.site_content
for each row
execute function public.touch_site_content();

-- MEDIA ASSETS (metadata + storage path)
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  bucket text not null default 'public',
  path text not null,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt text,
  title text,
  tags text[] not null default '{}',
  unique (bucket, path)
);

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_select_authed" on public.media_assets;
create policy "media_assets_select_authed"
on public.media_assets
for select
to authenticated
using (true);

drop policy if exists "media_assets_manage_staff" on public.media_assets;
create policy "media_assets_manage_staff"
on public.media_assets
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

