-- Run after schema.sql, platform.sql, and cms.sql
-- Structured CMS rows + audit log (production-oriented)

-- Applications: optional address from public apply form
alter table public.applications add column if not exists address text;

-- CMS content (page + section; draft/publish separate from site_content JSON)
create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text,
  body text,
  media_url text,
  published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create index if not exists cms_content_page_key_idx on public.cms_content(page_key);
create index if not exists cms_content_published_idx on public.cms_content(published, updated_at desc);

alter table public.cms_content enable row level security;

drop policy if exists "cms_content_read_public" on public.cms_content;
create policy "cms_content_read_public"
on public.cms_content
for select
to anon, authenticated
using (published = true);

drop policy if exists "cms_content_select_staff_all" on public.cms_content;
create policy "cms_content_select_staff_all"
on public.cms_content
for select
to authenticated
using (public.is_staff());

drop policy if exists "cms_content_manage_staff" on public.cms_content;
create policy "cms_content_manage_staff"
on public.cms_content
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop trigger if exists cms_content_touch_updated_at on public.cms_content;
create trigger cms_content_touch_updated_at
before update on public.cms_content
for each row
execute function public.touch_updated_at();

-- Activity / audit log (staff read; insert via trigger or service role — here: staff insert for app-side logging)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_staff" on public.activity_logs;
create policy "activity_logs_select_staff"
on public.activity_logs
for select
to authenticated
using (public.is_staff());

drop policy if exists "activity_logs_insert_staff" on public.activity_logs;
create policy "activity_logs_insert_staff"
on public.activity_logs
for insert
to authenticated
with check (actor_user_id = auth.uid() and public.is_staff());
