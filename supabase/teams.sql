-- Teams / workspaces (multi-user)
-- Run AFTER `supabase/schema.sql` + `supabase/user_system.sql`

-- TEAMS
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists teams_owner_user_id_idx on public.teams(owner_user_id, created_at desc);

-- TEAM MEMBERS (one row per user per team)
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists team_members_user_id_idx on public.team_members(user_id, created_at desc);

-- Helpers for RLS
create or replace function public.is_team_member(team uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = team
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_admin(team uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = team
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_team_owner(team uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = team
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  );
$$;

-- Auto-add owner membership on team creation
create or replace function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (team_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
after insert on public.teams
for each row execute procedure public.handle_new_team();

-- RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- TEAMS policies
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member"
on public.teams
for select
to authenticated
using (public.is_team_member(teams.id));

drop policy if exists "teams_insert_own" on public.teams;
create policy "teams_insert_own"
on public.teams
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "teams_update_owner" on public.teams;
create policy "teams_update_owner"
on public.teams
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "teams_delete_owner" on public.teams;
create policy "teams_delete_owner"
on public.teams
for delete
to authenticated
using (owner_user_id = auth.uid());

-- TEAM MEMBERS policies
drop policy if exists "team_members_select_team" on public.team_members;
create policy "team_members_select_team"
on public.team_members
for select
to authenticated
using (public.is_team_member(team_members.team_id));

-- Team admins/owners can add members
drop policy if exists "team_members_insert_admin" on public.team_members;
create policy "team_members_insert_admin"
on public.team_members
for insert
to authenticated
with check (
  public.is_team_admin(team_members.team_id)
  and team_members.role in ('admin', 'member')
);

-- Owners can promote/demote; admins cannot touch other admins/owner
drop policy if exists "team_members_update_owner" on public.team_members;
create policy "team_members_update_owner"
on public.team_members
for update
to authenticated
using (public.is_team_owner(team_members.team_id))
with check (public.is_team_owner(team_members.team_id));

-- Members can remove themselves (leave), admins/owners can remove non-owners
drop policy if exists "team_members_delete_leave_or_admin" on public.team_members;
create policy "team_members_delete_leave_or_admin"
on public.team_members
for delete
to authenticated
using (
  (team_members.user_id = auth.uid() and team_members.role <> 'owner')
  or (
    public.is_team_admin(team_members.team_id)
    and team_members.role <> 'owner'
  )
);

