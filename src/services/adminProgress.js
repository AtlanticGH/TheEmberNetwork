import { supabase } from '@/lib/supabaseClient'

async function getToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const token = data?.session?.access_token
  if (!token) throw new Error('Not authenticated')
  return token
}

export async function adminMarkComplete({ userId, type, id }) {
  const token = await getToken()
  const res = await fetch('/api/progress/mark-complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, type, id }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Request failed')
  return json
}

export async function adminMarkIncomplete({ userId, type, id }) {
  const token = await getToken()
  const res = await fetch('/api/progress/mark-incomplete', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, type, id }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Request failed')
  return json
}

