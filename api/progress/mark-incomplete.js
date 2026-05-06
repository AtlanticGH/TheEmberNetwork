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
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const token = readBearer(req)
  if (!token) return json(res, 401, { ok: false, error: 'Missing Authorization token' })
  const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userRes?.user) return json(res, 401, { ok: false, error: 'Invalid session' })
  const actorId = userRes.user.id

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

  const userId = String(body.userId || '')
  const type = String(body.type || '')
  const id = String(body.id || '')
  if (!userId || !type || !id) return json(res, 400, { ok: false, error: 'Missing userId/type/id' })

  if (type === 'lesson') {
    const { error } = await supabase.from('lesson_completions').delete().eq('user_id', userId).eq('lesson_id', id)
    if (error) return json(res, 500, { ok: false, error: error.message })
  } else if (type === 'module') {
    const { error } = await supabase.from('module_completions').delete().eq('user_id', userId).eq('module_id', id)
    if (error) return json(res, 500, { ok: false, error: error.message })
  } else if (type === 'course') {
    const { error } = await supabase.from('course_completions').delete().eq('user_id', userId).eq('course_id', id)
    if (error) return json(res, 500, { ok: false, error: error.message })
  } else {
    return json(res, 400, { ok: false, error: 'Invalid type' })
  }

  await supabase
    .from('activity_logs')
    .insert({
      actor_user_id: actorId,
      action: 'progress_mark_incomplete',
      entity_type: type,
      entity_id: id,
      metadata_json: { user_id: userId },
    })
    .catch(() => {})

  return json(res, 200, { ok: true })
}

