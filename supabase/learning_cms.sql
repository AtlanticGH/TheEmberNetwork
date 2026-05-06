-- Learning CMS extensions: lesson files, assignments, quizzes, free resources
-- Run AFTER supabase/schema.sql + supabase/platform.sql + supabase/cms.sql

-- LESSON FILES (materials/attachments)
create table if not exists public.lesson_files (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  title text,
  bucket text not null default 'public',
  path text not null,
  file_url text, -- optional (for external links); prefer bucket/path for Storage
  mime_type text,
  size_bytes bigint,
  file_type text,
  position int not null default 1 check (position > 0)
);

create index if not exists lesson_files_lesson_id_idx on public.lesson_files(lesson_id, position);
create index if not exists lesson_files_created_at_idx on public.lesson_files(created_at desc);

alter table public.lesson_files enable row level security;

drop policy if exists "lesson_files_select_published_lessons" on public.lesson_files;
create policy "lesson_files_select_published_lessons"
on public.lesson_files
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_files.lesson_id
      and l.status = 'published'
  )
);

drop policy if exists "lesson_files_manage_staff" on public.lesson_files;
create policy "lesson_files_manage_staff"
on public.lesson_files
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- ASSIGNMENTS (text instructions + optional file)
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  bucket text not null default 'public',
  path text,
  file_url text
);

create index if not exists assignments_lesson_id_idx on public.assignments(lesson_id, created_at desc);
alter table public.assignments enable row level security;

drop policy if exists "assignments_select_published_lessons" on public.assignments;
create policy "assignments_select_published_lessons"
on public.assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = assignments.lesson_id
      and l.status = 'published'
  )
);

drop policy if exists "assignments_manage_staff" on public.assignments;
create policy "assignments_manage_staff"
on public.assignments
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- QUIZZES (multiple choice questions)
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  question text not null,
  options_json jsonb not null default '[]'::jsonb,
  correct_answer text not null
);

create index if not exists quizzes_lesson_id_idx on public.quizzes(lesson_id, created_at desc);
alter table public.quizzes enable row level security;

drop policy if exists "quizzes_select_published_lessons" on public.quizzes;
create policy "quizzes_select_published_lessons"
on public.quizzes
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = quizzes.lesson_id
      and l.status = 'published'
  )
);

drop policy if exists "quizzes_manage_staff" on public.quizzes;
create policy "quizzes_manage_staff"
on public.quizzes
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

-- QUIZ ATTEMPTS (optional scoring tracking)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  answers_json jsonb not null default '{}'::jsonb
);

create index if not exists quiz_attempts_user_lesson_idx on public.quiz_attempts(user_id, lesson_id, created_at desc);
alter table public.quiz_attempts enable row level security;

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own"
on public.quiz_attempts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (user_id = auth.uid());

-- FREE RESOURCES (public downloads page)
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  category text,
  bucket text not null default 'public',
  path text,
  file_url text
);

create index if not exists resources_created_at_idx on public.resources(created_at desc);
create index if not exists resources_category_idx on public.resources(category);

alter table public.resources enable row level security;

drop policy if exists "resources_select_public" on public.resources;
create policy "resources_select_public"
on public.resources
for select
to anon, authenticated
using (true);

drop policy if exists "resources_manage_staff" on public.resources;
create policy "resources_manage_staff"
on public.resources
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

