-- Ember Network learning platform schema (Supabase/Postgres)
-- Run this in Supabase SQL Editor (new query) as the project owner.

-- Extensions
create extension if not exists pgcrypto;

-- PROFILES
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'student' check (role in ('student', 'mentor', 'staff', 'admin', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  mentor_user_id uuid references auth.users(id) on delete set null,
  profile_image_url text,
  joined_at timestamptz not null default now(),
  bio text,
  phone text,
  country text,
  goals text,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

-- Auto-provision profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- COURSES
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text,
  duration text,
  thumbnail_url text,
  category text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- MODULES
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position int not null check (position > 0),
  content jsonb,
  created_at timestamptz not null default now(),
  unique (course_id, position)
);

create index if not exists modules_course_id_idx on public.modules(course_id);

-- ENROLLMENTS
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  unique (user_id, course_id)
);

create index if not exists enrollments_user_id_idx on public.enrollments(user_id);
create index if not exists enrollments_course_id_idx on public.enrollments(course_id);

-- MODULE COMPLETIONS (progress)
create table if not exists public.module_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create index if not exists module_completions_user_id_idx on public.module_completions(user_id);
create index if not exists module_completions_module_id_idx on public.module_completions(module_id);

-- USER COURSE STATE (optional convenience)
create table if not exists public.user_course_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  last_active_at timestamptz not null default now(),
  last_module_id uuid references public.modules(id) on delete set null,
  primary key (user_id, course_id)
);

-- CERTIFICATES (optional)
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- MENTORSHIP MILESTONES
create table if not exists public.mentorship_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mentorship_milestones_user_id_idx on public.mentorship_milestones(user_id);

-- PROGRESS VIEW (per-user, per-enrollment)
create or replace view public.course_progress as
select
  e.user_id,
  e.course_id,
  count(distinct m.id) as total_modules,
  count(distinct mc.module_id) as completed_modules,
  case
    when count(distinct m.id) = 0 then 0
    else round((count(distinct mc.module_id)::numeric * 100) / count(distinct m.id), 0)
  end as percentage
from public.enrollments e
left join public.modules m
  on m.course_id = e.course_id
left join public.module_completions mc
  on mc.user_id = e.user_id and mc.module_id = m.id
group by e.user_id, e.course_id;

-- --------------------------
-- RLS
-- --------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.enrollments enable row level security;
alter table public.module_completions enable row level security;
alter table public.user_course_state enable row level security;
alter table public.certificates enable row level security;
alter table public.mentorship_milestones enable row level security;

-- PROFILES policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

-- Staff can read all profiles (admin CMS)
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Staff can update profiles (admin CMS)
drop policy if exists "profiles_update_staff" on public.profiles;
create policy "profiles_update_staff"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
);

-- COURSES policies (read-only for authenticated in v1)
drop policy if exists "courses_select_published" on public.courses;
create policy "courses_select_published"
on public.courses
for select
to authenticated
using (published = true);

-- Admin/staff can manage courses (CMS)
drop policy if exists "courses_manage_staff" on public.courses;
create policy "courses_manage_staff"
on public.courses
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
);

-- MODULES policies (read-only for authenticated in v1)
drop policy if exists "modules_select_by_course" on public.modules;
create policy "modules_select_by_course"
on public.modules
for select
to authenticated
using (true);

-- Staff can manage modules (course builder)
drop policy if exists "modules_manage_staff" on public.modules;
create policy "modules_manage_staff"
on public.modules
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  )
);

-- ENROLLMENTS policies
drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own"
on public.enrollments
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "enrollments_insert_own" on public.enrollments;
create policy "enrollments_insert_own"
on public.enrollments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "enrollments_update_own" on public.enrollments;
create policy "enrollments_update_own"
on public.enrollments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "enrollments_delete_own" on public.enrollments;
create policy "enrollments_delete_own"
on public.enrollments
for delete
to authenticated
using (user_id = auth.uid());

-- MODULE COMPLETIONS policies
drop policy if exists "module_completions_select_own" on public.module_completions;
create policy "module_completions_select_own"
on public.module_completions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "module_completions_insert_own" on public.module_completions;
create policy "module_completions_insert_own"
on public.module_completions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "module_completions_delete_own" on public.module_completions;
create policy "module_completions_delete_own"
on public.module_completions
for delete
to authenticated
using (user_id = auth.uid());

-- USER COURSE STATE policies
drop policy if exists "user_course_state_select_own" on public.user_course_state;
create policy "user_course_state_select_own"
on public.user_course_state
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_course_state_upsert_own" on public.user_course_state;
create policy "user_course_state_upsert_own"
on public.user_course_state
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_course_state_update_own" on public.user_course_state;
create policy "user_course_state_update_own"
on public.user_course_state
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- CERTIFICATES policies (read own)
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own"
on public.certificates
for select
to authenticated
using (user_id = auth.uid());

-- MILESTONES policies (read/update own)
drop policy if exists "milestones_select_own" on public.mentorship_milestones;
create policy "milestones_select_own"
on public.mentorship_milestones
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "milestones_insert_own" on public.mentorship_milestones;
create policy "milestones_insert_own"
on public.mentorship_milestones
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "milestones_update_own" on public.mentorship_milestones;
create policy "milestones_update_own"
on public.mentorship_milestones
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

