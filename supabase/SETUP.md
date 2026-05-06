## Supabase setup (Ember Network)

### 1) Create Supabase project
- Create a new project in Supabase.
- Enable **Email + Password** auth.

### 2) Apply schema + RLS
- Open **SQL Editor** and run, in order:
  1. `supabase/schema.sql`
  2. `supabase/platform.sql`
  3. `supabase/cms.sql`
  4. `supabase/storage.sql`
  3. `supabase/seed.sql` (optional, but recommended for v1 content)

### 3) Add env vars
- Copy `.env.example` to `.env.local` (or `.env`) and fill values:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 4) Run locally
```bash
npm install
npm run dev
```

