-- Dev-only dummy users (profiles)
-- IMPORTANT:
-- - You cannot create auth users via SQL on hosted Supabase.
-- - First create the auth users (Email/Password) using:
--   - Supabase Dashboard → Authentication → Users → "Add user"
--   OR use `node scripts/seed-dev-users.mjs` (service role key).
-- - Then run this SQL to set roles + profile data.

-- Replace the UUIDs below with the real auth.users ids for:
-- - admin@embernetwork.test
-- - member@embernetwork.test

-- Admin profile
insert into public.profiles (user_id, email, full_name, role)
values ('00000000-0000-0000-0000-000000000001', 'admin@embernetwork.test', 'Ember Admin', 'admin')
on conflict (user_id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

-- Member profile (role in schema is 'student')
insert into public.profiles (user_id, email, full_name, role)
values ('00000000-0000-0000-0000-000000000002', 'member@embernetwork.test', 'Ember Member', 'student')
on conflict (user_id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

