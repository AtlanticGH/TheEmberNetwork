import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { getMyProfile } from '../services/db'
import { AuthContext } from './AuthContextBase'
import { flushQueuedApplications } from '../services/applications'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      if (!user) {
        setProfile(null)
        return null
      }
      const p = await getMyProfile()
      setProfile(p)
      return p
    } catch {
      setProfile(null)
      return null
    }
  }, [user])

  useEffect(() => {
    let ignore = false

    const init = async () => {
      setLoading(true)

      if (!isSupabaseConfigured || !supabase) {
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.getSession()
      if (ignore) return
      if (!error) {
        setSession(data.session || null)
        setUser(data.session?.user || null)
      }
      setLoading(false)
    }

    init()
    // Public/offline intake sync (safe no-op if none queued)
    flushQueuedApplications().catch(() => {})

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        ignore = true
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
    })

    return () => {
      ignore = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setProfile(null))
      return
    }
    queueMicrotask(() => {
      refreshProfile()
    })
  }, [user, refreshProfile])

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      profile,
      refreshProfile,
      isAuthed: !!user,
      authMode: 'supabase',
    }),
    [loading, session, user, profile, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

