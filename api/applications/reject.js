const { createClient } = require('@supabase/supabase-js')
const { sendRejectedEmail } = require('../../../lib/email')

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

const buckets = new Map()
function rateLimit(ip, key, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const k = `${ip}:${key}`
  const cur = buckets.get(k) || { n: 0, reset: now + windowMs }
  if (now > cur.reset) {
    cur.n = 0
    cur.reset = now + windowMs
  }
  cur.n += 1
  buckets.set(k, cur)
  return cur.n <= limit
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'unknown'
  if (!rateLimit(ip, 'reject', 20, 60_000)) return json(res, 429, { ok: false, error: 'Too many requests' })

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

  const applicationId = String(body.applicationId || '')
  const rejectionReason = String(body.rejectionReason || '').trim().slice(0, 800)
  if (!applicationId) return json(res, 400, { ok: false, error: 'Missing applicationId' })

  const { data: app, error: appErr } = await supabase
    .from('applications')
    .select('id,status,email,full_name,invited_user_id')
    .eq('id', applicationId)
    .single()
  if (appErr) return json(res, 404, { ok: false, error: 'Application not found' })

  if (app.invited_user_id) return json(res, 409, { ok: false, error: 'Cannot reject: account already created' })

  const nowIso = new Date().toISOString()
  const { error: updErr } = await supabase
    .from('applications')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason || null,
      decision_email_sent_at: nowIso,
      decision_email_type: 'rejected',
    })
    .eq('id', applicationId)
  if (updErr) return json(res, 500, { ok: false, error: updErr.message })

  await supabase.from('activity_logs').insert({
    actor_user_id: actorId,
    action: 'application_rejected',
    entity_type: 'application',
    entity_id: applicationId,
    metadata_json: { applicant_email: app.email },
  }).catch(() => {})

  try {
    await sendRejectedEmail({
      to: app.email,
      fullName: app.full_name,
      reason: rejectionReason,
    })
  } catch (err) {
    return json(res, 500, { ok: false, error: `Rejected, but failed to send email: ${err?.message || 'email error'}` })
  }

  return json(res, 200, { ok: true })
}

