-- Ember Network mentorship platform - additional schema
-- Run AFTER `supabase/schema.sql`.

-- Helper: admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.status = 'active'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin', 'staff')
      and p.status = 'active'
  );
$$;

-- APPLICATIONS (public application intake)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'submitted' check (status in ('submitted', 'waitlist', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  notes text,

  full_name text not null,
  email text not null,
  phone text,
  interest_role text,
  message text,

  -- link to a user once invited/accepted
  invited_user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz
);

drop trigger if exists applications_touch_updated_at on public.applications;
create trigger applications_touch_updated_at
before update on public.applications
for each row
execute function public.touch_updated_at();

create index if not exists applications_status_idx on public.applications(status, created_at desc);
create index if not exists applications_email_idx on public.applications(email);

alter table public.applications enable row level security;

-- Allow anyone (anon or authenticated) to submit an application.
drop policy if exists "applications_insert_public" on public.applications;
create policy "applications_insert_public"
on public.applications
for insert
to anon, authenticated
with check (
  status = 'submitted'
  and reviewed_at is null
  and reviewed_by is null
  and invited_user_id is null
);

-- Admin can read/update applications.
drop policy if exists "applications_select_admin" on public.applications;
create policy "applications_select_admin"
on public.applications
for select
to authenticated
using (public.is_staff());

drop policy if exists "applications_update_admin" on public.applications;
create policy "applications_update_admin"
on public.applications
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- Stamp review metadata when staff update applications.
create or replace function public.stamp_application_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.reviewed_by = auth.uid();
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists applications_stamp_review on public.applications;
create trigger applications_stamp_review
before update on public.applications
for each row
execute function public.stamp_application_review();

-- LESSONS (inside modules)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  position int not null check (position > 0),
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  unique (module_id, position)
);

drop trigger if exists lessons_touch_updated_at on public.lessons;
create trigger lessons_touch_updated_at
before update on public.lessons
for each row
execute function public.touch_updated_at();

create index if not exists lessons_module_id_idx on public.lessons(module_id);

alter table public.lessons enable row level security;

-- Lessons are readable by authenticated users.
drop policy if exists "lessons_select_authed" on public.lessons;
create policy "lessons_select_authed"
on public.lessons
for select
to authenticated
using (status = 'published');

-- Admin can manage lessons.
drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all"
on public.lessons
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- LESSON COMPLETIONS
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_completions_user_id_idx on public.lesson_completions(user_id);
create index if not exists lesson_completions_lesson_id_idx on public.lesson_completions(lesson_id);

alter table public.lesson_completions enable row level security;

drop policy if exists "lesson_completions_select_own" on public.lesson_completions;
create policy "lesson_completions_select_own"
on public.lesson_completions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "lesson_completions_insert_own" on public.lesson_completions;
create policy "lesson_completions_insert_own"
on public.lesson_completions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "lesson_completions_delete_own" on public.lesson_completions;
create policy "lesson_completions_delete_own"
on public.lesson_completions
for delete
to authenticated
using (user_id = auth.uid());

-- ANNOUNCEMENTS + NOTIFICATIONS
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'students', 'mentors')),
  published_at timestamptz
);

alter table public.announcements enable row level security;

drop policy if exists "announcements_select_authed" on public.announcements;
create policy "announcements_select_authed"
on public.announcements
for select
to authenticated
using (published_at is not null);

drop policy if exists "announcements_admin_manage" on public.announcements;
create policy "announcements_admin_manage"
on public.announcements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  type text not null default 'announcement',
  title text not null,
  body text,
  read_at timestamptz,
  data jsonb
);

create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Create per-user notifications when an announcement is published.
create or replace function public.notify_announcement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.published_at is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  select
    p.user_id,
    'announcement',
    new.title,
    new.body,
    jsonb_build_object('announcement_id', new.id)
  from public.profiles p;

  return new;
end;
$$;

drop trigger if exists announcements_notify on public.announcements;
create trigger announcements_notify
after insert or update of published_at on public.announcements
for each row
when (new.published_at is not null)
execute function public.notify_announcement();

-- SESSIONS (upcoming mentorship sessions)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  meeting_url text
);

alter table public.sessions enable row level security;

drop policy if exists "sessions_select_authed" on public.sessions;
create policy "sessions_select_authed"
on public.sessions
for select
to authenticated
using (true);

drop policy if exists "sessions_admin_manage" on public.sessions;
create policy "sessions_admin_manage"
on public.sessions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.session_attendees (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'confirmed', 'declined')),
  primary key (session_id, user_id)
);

alter table public.session_attendees enable row level security;

drop policy if exists "session_attendees_select_own" on public.session_attendees;
create policy "session_attendees_select_own"
on public.session_attendees
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "session_attendees_update_own" on public.session_attendees;
create policy "session_attendees_update_own"
on public.session_attendees
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "session_attendees_admin_manage" on public.session_attendees;
create policy "session_attendees_admin_manage"
on public.session_attendees
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

