const { createClient } = require('@supabase/supabase-js')

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

function getEnv(name) {
  return process.env[name] || ''
}

function readBearer(req) {
  const h = req.headers?.authorization || req.headers?.Authorization || ''
  const m = String(h).match(/^Bearer\s+(.+)$/i)
  return m ? m[1] : ''
}

function isStaffRole(role) {
  return ['admin', 'super_admin', 'staff'].includes(role)
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' })

  const SUPABASE_URL = getEnv('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  const SITE_URL = getEnv('SITE_URL')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const token = readBearer(req)
  if (!token) return json(res, 401, { ok: false, error: 'Missing Authorization token' })

  // Verify the caller via JWT → user
  const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userRes?.user) return json(res, 401, { ok: false, error: 'Invalid session' })

  const actorId = userRes.user.id

  // Verify staff role via profiles (server-side check; RLS bypassed by service key, but logic is explicit)
  const { data: actorProfile, error: actorProfileErr } = await supabase
    .from('profiles')
    .select('role,status')
    .eq('user_id', actorId)
    .maybeSingle()
  if (actorProfileErr) return json(res, 500, { ok: false, error: actorProfileErr.message })
  if (!actorProfile || actorProfile.status !== 'active' || !isStaffRole(actorProfile.role)) {
    return json(res, 403, { ok: false, error: 'Forbidden' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  if (!body || typeof body !== 'object') return json(res, 400, { ok: false, error: 'Invalid JSON body' })

  const applicationId = String(body.applicationId || '')
  const requestedRole = String(body.role || 'student')
  const role = ['student', 'mentor', 'staff', 'admin', 'super_admin'].includes(requestedRole) ? requestedRole : 'student'

  if (!applicationId) return json(res, 400, { ok: false, error: 'Missing applicationId' })

  const { data: app, error: appErr } = await supabase
    .from('applications')
    .select('id,status,email,full_name,invited_user_id')
    .eq('id', applicationId)
    .single()
  if (appErr) return json(res, 404, { ok: false, error: 'Application not found' })

  if (app.invited_user_id) return json(res, 409, { ok: false, error: 'Application already invited' })
  if (app.status !== 'approved') return json(res, 400, { ok: false, error: 'Application must be approved before inviting' })

  const redirectTo = SITE_URL ? `${SITE_URL.replace(/\/$/, '')}/login` : undefined

  // Invite the user by email; this creates an auth user.
  const { data: inviteRes, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(app.email, {
    redirectTo,
    data: { full_name: app.full_name || '' },
  })
  if (inviteErr) return json(res, 500, { ok: false, error: inviteErr.message })

  const invitedUserId = inviteRes?.user?.id
  if (!invitedUserId) return json(res, 500, { ok: false, error: 'Invite failed (no user id returned)' })

  // Stamp application with invited user
  const { error: updErr } = await supabase
    .from('applications')
    .update({ invited_user_id: invitedUserId, invited_at: new Date().toISOString() })
    .eq('id', applicationId)
  if (updErr) return json(res, 500, { ok: false, error: updErr.message })

  // Ensure role on profile (handle_new_user will create basic profile; this upsert ensures role)
  const { error: profErr } = await supabase
    .from('profiles')
    .upsert(
      { user_id: invitedUserId, email: app.email, full_name: app.full_name || '', role, status: 'active' },
      { onConflict: 'user_id' }
    )
  if (profErr) return json(res, 500, { ok: false, error: profErr.message })

  return json(res, 200, { ok: true, invitedUserId })
}

