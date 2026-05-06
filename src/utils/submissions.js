import { submitContact } from '../services/contactSubmissions'

const storageKeys = {
  registrations: 'forge-registrations',
  contactFallback: 'forge-contact-submissions',
}

export async function submitSubmission(payload) {
  try {
    if (payload?.source === 'contact') {
      const res = await submitContact(payload)
      if (!res?.ok) {
        throw new Error(res?.error || 'Unable to send message.')
      }
      return res
    }
    // Future: wire other submission types (e.g. registrations) here.
    return { ok: true }
  } catch {
    const key = payload.source === 'registration' ? storageKeys.registrations : storageKeys.contactFallback
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    current.unshift({ ...payload, ts: Date.now(), fallback: true })
    localStorage.setItem(key, JSON.stringify(current.slice(0, 50)))
    return { ok: true, fallback: true }
  }
}

