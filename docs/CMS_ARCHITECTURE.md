# CMS / Admin platform — production architecture (Ember Network)

This project ships as a **React 19 + Vite SPA** with **Supabase (PostgreSQL + Auth + Storage + RLS)** as the primary backend. Deploying on **Vercel** hosts static assets and rewrites; **data plane and authorization** remain on Supabase (recommended for production).

## 1. Frontend (React Router)

| Area | Path pattern | Guard |
|------|--------------|--------|
| Public | `/`, `/about`, `/services`, `/apply`, `/login` | None |
| Member | `/member`, `/member/profile`, `/member/activity`, `/member/courses/*` | `ProtectedRoute` (session required) |
| Admin | `/admin`, `/admin/dashboard`, … | `AdminGate` (staff roles only; login UI at `/admin` when logged out) |

Legacy paths (`/dashboard`, `/profile`, `/courses`) **redirect** to `/member` equivalents for bookmarks and SEO continuity.

**State & auth:** `AuthContext` wraps Supabase session. Profile row in `public.profiles` drives **RBAC** client-side for UX; **RLS** enforces security server-side.

## 2. “Backend” on Vercel (options)

| Pattern | Use when |
|---------|----------|
| **Supabase-only (current)** | CRUD via `@supabase/supabase-js` + RLS policies. No Node server required. |
| **Vercel Serverless** (`/api/*`) | Rate-limited auth proxy, invite-user webhooks, payment webhooks, heavy validation. |
| **Supabase Edge Functions** | Same as serverless but colocated with DB; good for invite flows and secrets. |

Auth tokens today are **Supabase-managed** (not custom JWT cookies). For strict HTTP-only cookie sessions, add a thin **serverless session exchange** (optional upgrade).

## 3. Database (PostgreSQL / Supabase)

- **`auth.users`**: identities (managed by Supabase Auth).
- **`public.profiles`**: `role` (`student` | `mentor` | `staff` | `admin` | `super_admin`), `status`, profile fields. Maps to product roles: `student`/`mentor` ≈ **member**, `staff`/`admin`/`super_admin` ≈ **admin**.
- **`public.applications`**: intake; public insert; staff update (`platform.sql`).
- **`public.site_content`**: JSON CMS blocks (e.g. hero) (`cms.sql`).
- **`public.cms_content`**: structured page/section rows (draft/publish) — see `supabase/platform_cms_v2.sql`.
- **`public.activity_logs`**: audit trail for admin actions — see `supabase/platform_cms_v2.sql`.
- **`public.notifications`**: in-app notifications (existing).

Indexes: `(email)`, `(status, created_at)` on applications; `(created_at desc)` on activity_logs.

## 4. RBAC (see `src/lib/rbac.js`)

| Action | super_admin | admin / staff | member (student/mentor) |
|--------|---------------|----------------|-------------------------|
| `/admin` UI | Yes | Yes | No |
| Settings / manage admins | Yes | No | No |
| Applications, members, CMS | Yes | Yes | No |
| Member dashboard | Yes (optional) | Yes | Yes |

**Enforcement:** RLS `is_staff()` / `is_admin()` in SQL; UI uses `can()` to hide routes.

## 5. Route protection

- **Client:** `ProtectedRoute`, `AdminGate`, `SuperAdminRoute`.
- **Vercel:** `vercel.json` rewrites all paths to `index.html` for SPA + security headers.
- **Edge middleware (optional):** cookie session validation if you add serverless auth.

## 6. Security

- **RLS** on every sensitive table.
- **Input trimming / max lengths** on forms; rich text should be sanitized server-side when you add HTML CMS.
- **Rate limiting:** add Vercel middleware or Supabase Edge Function for `/login` and application submit (recommended).
- **Audit:** insert into `activity_logs` on critical mutations (extend `admin` service calls).

## 7. Scalability

- Lazy-loaded admin routes (already).
- Pagination on large tables (extend list queries with `range()`).
- Cache public CMS reads (SWR/React Query or `stale-while-revalidate` headers on static pages if you prerender).

## 8. CI/CD (Vercel)

Connect Git → Preview deployments on PR → Production on main. Set env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, service keys only in serverless/Edge (never in client).
