-- Admin-controlled progress/completions
-- Run AFTER supabase/schema.sql and supabase/platform.sql

-- Add audit metadata to completion tables
alter table public.lesson_completions
  add column if not exists marked_by uuid references auth.users(id) on delete set null;

alter table public.lesson_completions
  add column if not exists marked_at timestamptz not null default now();

alter table public.module_completions
  add column if not exists marked_by uuid references auth.users(id) on delete set null;

alter table public.module_completions
  add column if not exists marked_at timestamptz not null default now();

-- Course completions (admin marks whole course completed)
create table if not exists public.course_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completed_at timestamptz not null default now(),
  marked_by uuid references auth.users(id) on delete set null,
  marked_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists course_completions_user_id_idx on public.course_completions(user_id);
create index if not exists course_completions_course_id_idx on public.course_completions(course_id);

alter table public.course_completions enable row level security;

-- RLS: members can READ their own completion status (no writes)
drop policy if exists "lesson_completions_select_own" on public.lesson_completions;
create policy "lesson_completions_select_own"
on public.lesson_completions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "module_completions_select_own" on public.module_completions;
create policy "module_completions_select_own"
on public.module_completions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "course_completions_select_own" on public.course_completions;
create policy "course_completions_select_own"
on public.course_completions
for select
to authenticated
using (user_id = auth.uid());

-- Remove member write policies (if they exist)
drop policy if exists "lesson_completions_insert_own" on public.lesson_completions;
drop policy if exists "lesson_completions_delete_own" on public.lesson_completions;
drop policy if exists "module_completions_insert_own" on public.module_completions;
drop policy if exists "module_completions_delete_own" on public.module_completions;

-- Staff can manage completions
drop policy if exists "lesson_completions_manage_staff" on public.lesson_completions;
create policy "lesson_completions_manage_staff"
on public.lesson_completions
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "module_completions_manage_staff" on public.module_completions;
create policy "module_completions_manage_staff"
on public.module_completions
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "course_completions_manage_staff" on public.course_completions;
create policy "course_completions_manage_staff"
on public.course_completions
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Allow staff to read enrollments for progress views
drop policy if exists "enrollments_select_staff" on public.enrollments;
create policy "enrollments_select_staff"
on public.enrollments
for select
to authenticated
using (public.is_staff());

