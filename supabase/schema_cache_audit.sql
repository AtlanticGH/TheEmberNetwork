-- Supabase schema cache / API visibility audit + refresh
-- Run in Supabase Dashboard → SQL Editor as project owner.

-- 1) Verify expected tables exist (public schema)
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- 2) Verify columns (profiles)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- 3) Verify RLS enabled + policies exist
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'teams', 'team_members')
order by c.relname;

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'teams', 'team_members')
order by tablename, policyname;

-- 4) Verify PostgREST can "see" tables (basic metadata)
select *
from pg_catalog.pg_tables
where schemaname = 'public'
order by tablename;

-- 5) Verify FK relationships (for embedded selects like team_members → teams(*))
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints as tc
join information_schema.key_column_usage as kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage as ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name in ('teams', 'team_members')
order by tc.table_name, kcu.column_name;

-- 6) Grants (minimum viable: authenticated can use schema + run DML on app tables)
-- NOTE: Avoid granting anon wide DML unless you explicitly want public writes.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.teams to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;

-- Ensure future tables in public grant similarly (optional)
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

-- 7) Force PostgREST schema cache refresh
notify pgrst, 'reload schema';

