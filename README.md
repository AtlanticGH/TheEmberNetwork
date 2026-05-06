# Ten dummy (React + Vite + Supabase)

## Getting started

Install dependencies:

```bash
npm install
```

Create a local env file:

- Copy `.env.example` → `.env`
- Fill in **client-safe** Supabase keys:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - (Optional) `SITE_URL` for `/api/inviteApplicant`

Start the dev server:

```bash
npm run dev
```

## Troubleshooting

If you see:

> Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env.

…it means `.env` is missing those values (or they’re empty). After updating `.env`, restart the dev server so Vite picks up the new env vars.

## Supabase dev users (optional)

If you want the same dummy accounts inside Supabase Auth:
- Run the SQL files in order:
  - `supabase/schema.sql`
  - `supabase/platform.sql`
  - `supabase/cms.sql`
  - `supabase/platform_cms_v2.sql`
  - `supabase/contact.sql`
  - `supabase/learning_cms.sql`
  - `supabase/admin_progress.sql`
  - `supabase/storage.sql`
- Create users + profiles:
  - **Script**: `node scripts/seed-dev-users.mjs` (requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
  - **SQL only**: `supabase/seed-dev-users.sql` (requires you to create auth users first)
