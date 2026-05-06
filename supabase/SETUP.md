## Supabase setup (Ember Network)

### 1) Create Supabase project
- Create a new project in Supabase.
- Enable **Email + Password** auth.

### 2) Apply schema + RLS
- Open **SQL Editor** and run, in order:
  1. `supabase/schema.sql`
  2. `supabase/user_system.sql`
  3. `supabase/teams.sql`
  4. `supabase/platform.sql`
  5. `supabase/cms.sql`
  6. `supabase/platform_cms_v2.sql`
  7. `supabase/contact.sql`
  8. `supabase/learning_cms.sql`
  9. `supabase/admin_progress.sql`
  10. `supabase/storage.sql`
  11. `supabase/avatars_storage.sql`
  12. `supabase/seed.sql` (optional, but recommended for v1 content)

### 3) Add env vars
- Copy `.env.example` → `.env` and fill values:
  - **Client (Vite)**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - **Server (Vercel `/api/*`)**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - **Optional**: `SITE_URL` (used for invite redirects)

### 4) Run locally
```bash
npm install
npm run dev
```

