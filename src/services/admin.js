import { supabase } from '@/lib/supabaseClient'
import { logActivity } from './activityLogs'

export async function listAdminSummary() {
  const [{ count: applications_submitted, error: aErr }, { count: members, error: pErr }, { count: courses, error: cErr }] =
    await Promise.all([
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    ])
  if (aErr) throw aErr
  if (pErr) throw pErr
  if (cErr) throw cErr
  return { applications_submitted: applications_submitted || 0, members: members || 0, courses: courses || 0 }
}

export async function listApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateApplicationStatus(id, status) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  try {
    await logActivity({
      action: 'application_status_changed',
      entityType: 'application',
      entityId: id,
      metadata: { status },
    })
  } catch {
    // non-fatal if audit table not migrated yet
  }
  return data
}

export async function updateApplication(id, patch) {
  const { data, error } = await supabase
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  try {
    await logActivity({
      action: 'application_updated',
      entityType: 'application',
      entityId: id,
      metadata: { keys: Object.keys(patch || {}) },
    })
  } catch {
    // ignore audit failures
  }
  return data
}

export async function inviteApprovedApplicant(applicationId, { role = 'student' } = {}) {
  const { data: sessionRes, error: sessErr } = await supabase.auth.getSession()
  if (sessErr) throw sessErr
  const token = sessionRes?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/api/inviteApplicant', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationId, role }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Invite failed')
  return json
}

export async function approveApplication(applicationId) {
  const { data: sessionRes, error: sessErr } = await supabase.auth.getSession()
  if (sessErr) throw sessErr
  const token = sessionRes?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/api/applications/approve', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationId }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Approve failed')
  return json
}

export async function rejectApplication(applicationId, { rejectionReason = '' } = {}) {
  const { data: sessionRes, error: sessErr } = await supabase.auth.getSession()
  if (sessErr) throw sessErr
  const token = sessionRes?.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/api/applications/reject', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationId, rejectionReason }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Reject failed')
  return json
}

