import { supabase } from '@/lib/supabaseClient'

const QUEUE_KEY = 'ember-application-queue'

function readQueue() {
  try {
    const v = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(0, 50)))
}

export async function submitApplication(payload) {
  const row = {
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone || null,
    address: payload.address || null,
    interest_role: payload.interest_role || null,
    message: payload.message || null,
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert(row)
      .select('id, created_at')
      .single()

    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    // Offline / network errors: queue for later sync.
    const q = readQueue()
    q.unshift({ row, ts: Date.now() })
    writeQueue(q)
    return { ok: true, queued: true, error: err?.message }
  }
}

export async function flushQueuedApplications() {
  const q = readQueue()
  if (!q.length) return { ok: true, flushed: 0 }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: true, flushed: 0 }
  }

  let flushed = 0
  const remaining = []

  for (const item of q) {
    try {
      const { error } = await supabase.from('applications').insert(item.row)
      if (error) throw error
      flushed += 1
    } catch {
      remaining.push(item)
    }
  }

  writeQueue(remaining)
  return { ok: true, flushed, remaining: remaining.length }
}

