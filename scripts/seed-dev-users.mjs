/**
 * Dev-only: create the Ember dummy auth users in Supabase Auth.
 *
 * Requires server-side env vars:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-dev-users.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const users = [
  {
    email: 'admin@embernetwork.test',
    password: 'Admin123!',
    email_confirm: true,
    user_metadata: { full_name: 'Ember Admin' },
  },
  {
    email: 'member@embernetwork.test',
    password: 'Member123!',
    email_confirm: true,
    user_metadata: { full_name: 'Ember Member' },
  },
]

async function ensureUser(u) {
  const { data: listed, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listErr) throw listErr

  const existing = listed?.users?.find((x) => String(x.email).toLowerCase() === u.email.toLowerCase())
  if (existing) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: u.password,
      email_confirm: true,
      user_metadata: u.user_metadata,
    })
    if (error) throw error
    return data.user
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser(u)
  if (error) throw error
  return data.user
}

async function main() {
  const created = []
  for (const u of users) {
    const user = await ensureUser(u)
    created.push({ email: user.email, id: user.id })
  }

  // Upsert profiles and roles
  const [admin, member] = created
  const rows = [
    { user_id: admin.id, email: admin.email, full_name: 'Ember Admin', role: 'admin' },
    { user_id: member.id, email: member.email, full_name: 'Ember Member', role: 'student' },
  ]

  const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert(rows, { onConflict: 'user_id' })
  if (upsertErr) throw upsertErr

  console.log('Seeded dev users:')
  created.forEach((u) => console.log(`- ${u.email}: ${u.id}`))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

