-- User system extensions (username + avatar support)
-- Run AFTER `supabase/schema.sql`

-- Case-insensitive usernames
create extension if not exists citext;

alter table public.profiles
  add column if not exists username citext;

alter table public.profiles
  add column if not exists avatar_path text;

-- Optional constraints
alter table public.profiles
  add constraint profiles_username_len_chk
  check (username is null or char_length(username) between 3 and 30) not valid;

-- Uniqueness (citext handles case-insensitive uniqueness)
create unique index if not exists profiles_username_unique_idx
  on public.profiles (username);

