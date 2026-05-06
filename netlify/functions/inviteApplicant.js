const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SITE_URL = process.env.SITE_URL || process.env.URL

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }
}

async function getAuthedUser(accessToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) return null
  return await res.json()
}

async function isAdmin(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&user_id=eq.${encodeURIComponent(userId)}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!res.ok) return false
  const rows = await res.json()
  return rows?.[0]?.role === 'admin'
}

async function inviteByEmail({ email, fullName, role }) {
  const redirectTo = SITE_URL ? `${SITE_URL.replace(/\/$/, '')}/login` : undefined
  const res = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      data: { full_name: fullName || '', role: role || 'student' },
      ...(redirectTo ? { redirectTo } : {}),
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Invite failed: ${text || res.status}`)
  }
  return await res.json()
}

async function updateApplication(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Application update failed: ${text || res.status}`)
  }
  const rows = await res.json()
  return rows?.[0] || null
}

async function upsertProfile(userId, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ user_id: userId, ...patch }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Profile upsert failed: ${text || res.status}`)
  }
  const rows = await res.json()
  return rows?.[0] || null
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { ok: false, error: 'Missing server env: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY' })
  }

  const accessToken = (event.headers.authorization || event.headers.Authorization || '').replace(/^Bearer\s+/i, '')
  if (!accessToken) return json(401, { ok: false, error: 'Missing Authorization bearer token' })

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' })
  }

  const { applicationId, role } = payload
  if (!applicationId) return json(400, { ok: false, error: 'Missing applicationId' })

  try {
    const user = await getAuthedUser(accessToken)
    if (!user?.id) return json(401, { ok: false, error: 'Invalid auth session' })
    const okAdmin = await isAdmin(user.id)
    if (!okAdmin) return json(403, { ok: false, error: 'Admin access required' })

    // Load the application row
    const appRes = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*&id=eq.${encodeURIComponent(applicationId)}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })
    if (!appRes.ok) {
      const text = await appRes.text()
      throw new Error(`Unable to load application: ${text || appRes.status}`)
    }
    const apps = await appRes.json()
    const app = apps?.[0]
    if (!app) return json(404, { ok: false, error: 'Application not found' })
    if (app.status !== 'approved') return json(422, { ok: false, error: 'Application must be approved before inviting' })
    if (app.invited_user_id) return json(409, { ok: false, error: 'Applicant already invited' })

    // Invite user by email (creates auth user + sends invite email)
    const invitedUser = await inviteByEmail({
      email: app.email,
      fullName: app.full_name,
      role: role || 'student',
    })

    // Ensure profile exists and role/name are set
    await upsertProfile(invitedUser.id, { full_name: app.full_name, role: role || 'student', email: app.email })

    // Update application with invite linkage
    const updated = await updateApplication(app.id, {
      invited_user_id: invitedUser.id,
      invited_at: new Date().toISOString(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })

    return json(200, { ok: true, invitedUserId: invitedUser.id, application: updated })
  } catch (err) {
    return json(500, { ok: false, error: err?.message || 'Invite failed' })
  }
}

