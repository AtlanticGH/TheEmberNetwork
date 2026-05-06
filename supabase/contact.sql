-- Contact submissions (public insert; staff read)
-- Run after schema.sql + platform.sql

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null
);

create index if not exists contact_submissions_created_at_idx on public.contact_submissions(created_at desc);
create index if not exists contact_submissions_email_idx on public.contact_submissions(email);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_insert_public" on public.contact_submissions;
create policy "contact_submissions_insert_public"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_submissions_select_staff" on public.contact_submissions;
create policy "contact_submissions_select_staff"
on public.contact_submissions
for select
to authenticated
using (public.is_staff());

