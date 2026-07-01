import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { usersApi } from '../utils/api'
import type { User } from '../types'

interface SalamiUserState {
  user:      User | null
  loading:   boolean
  error:     string | null
  isAdmin:   boolean
  isPremium: boolean
  refetch:   () => void
}

export function useSalamiUser(): SalamiUserState {
  const { isSignedIn, isLoaded } = useAuth()
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!isSignedIn) { setUser(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await usersApi.me()
      if (res.success && res.data) setUser(res.data as User)
      else setError(res.message ?? 'Could not load profile.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading profile.')
    } finally {
      setLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (isLoaded) fetch()
  }, [isLoaded, isSignedIn, fetch])

  const isAdmin   = user?.is_admin ?? false
  const isPremium = user ? user.subscription !== 'free' : false

  return { user, loading, error, isAdmin, isPremium, refetch: fetch }
}
